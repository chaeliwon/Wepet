from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, File, UploadFile
import os
import torch
from transformers import CLIPProcessor, CLIPModel
import io
from PIL import Image
import numpy as np
import json
from db import get_database_connection  # 데이터베이스 연결 함수 import
import traceback
from rembg import remove

load_dotenv()  # .env 파일에서 환경 변수 불러오기

openai_api_key = os.getenv("OPENAI_API_KEY")

# FastAPI 앱 생성
app = FastAPI()

# Langchain 설정
llm_model = ChatOpenAI(model_name="gpt-4o-mini", temperature=0.5, max_tokens=500)

# CLIP 모델 및 프로세서 로드
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# 프롬프트 설정
prompt = PromptTemplate.from_template(
    "당신은 애완동물을 추천하기위해 사람들과 대화합니다. 사람들의 대화에서 원하고있는 동물의 키워드를 뽑아낼거에요. 대답을 할때에 사람들의 말속에서 키워드를 뽑아 나열해 대답합니다. 당신이 뽑아낸 데이터는 임베딩하는 api에 전달될것입니다 "
    "말끝에 멍! 을 붙일거에요. 이전 대화: {history} 새로운 질문: {input}"
)

# 사용자별 메모리 저장 딕셔너리
user_memories = {}


# 요청 모델 정의
class QuestionRequest(BaseModel):
    user_id: str
    input: str


class TextEmbeddingRequest(BaseModel):
    text: str


# 1. LangChain 관련 함수들
# 사용자별 메모리 생성 및 체인 생성 함수
def get_conversation_chain(user_id):  # user_id는 사용자를 식별하는 고유값
    if user_id not in user_memories:  # 유저메모리에 유저아이디가 없다면! 새로운 대화메모리를 생성한다
        user_memories[user_id] = ConversationBufferMemory(
            return_messages=True)  # ConversationBufferMemory는 대화를 저장하고 유지한다, return_messages=True 대화내용을 메세지형태로 반환
    user_memory = user_memories[user_id]  # 현재 사용자의 대화메모리 할당
    return ConversationChain(llm=llm_model, memory=user_memory,
                             prompt=prompt)  # ConversationChain은 대화관리 체인! 언어모델, 메모리, 프롬프트 템플릿을 지정


# 2. CLIP 관련 함수들
# CLIP을 이용한 텍스트 임베딩 생성 함수
def generate_text_embedding(text):  # 텍스트 임베딩 함수를 정의합니다
    inputs = clip_processor(text=[text],
                            return_tensors="pt")  # 새로 배운점 ! : **input은 변수가 딕셔너리 형태일때 키-값 쌍을 각각의 키워드 인자로 분해하여 전달하는코드
    # 여기서 이미 전처리로 딕셔너리로 만들기 때문에 하단에서 **input을 사용하는 것이다!
    # clip_processor 는 클립의 기능으로 입력된 텍스트를 모델이 이해할수 있는 상태로 전처리 해줍니다. 상단에 정의한 부분에서 불러오고 있습니다.
    # 함수안의 text=[text] 는 입력 텍스트를 리스트 형태로 전달합니다. 왜 리스트 형식으로 보내냐면 클립은 텍스트나 이미지 입력을 배치형태로 처리하기 때문
    # return_tensors="pt" 이부분은 출력형식을 텐서로 지정하는 것입니다. 이것은 모델에 입력하기 위한 데이터 구조입니다
    with torch.no_grad():
        text_embedding = clip_model.get_text_features(**inputs).cpu().numpy()
    # 임베딩 벡터 정규화
    text_embedding = text_embedding / np.linalg.norm(text_embedding)
    return text_embedding.tolist()  # 이코드에서 최종적으로 text_embedding은 리스트로 반환합니다. 이값을 가지고 이미지랑 유사도를 비교할거에요!


# CLIP을 이용한 이미지 임베딩 생성 함수
def generate_image_embedding(image):
    inputs = clip_processor(images=image, return_tensors="pt")  # images=image 는 입력이미지 데이터를 알려주는것입니다
    with torch.no_grad():
        image_embedding = clip_model.get_image_features(**inputs).cpu().numpy()
    # 임베딩 벡터 정규화
    image_embedding = image_embedding / np.linalg.norm(image_embedding)
    return image_embedding.tolist()  # 임베딩된 결과를 반환합니다


# 이미지 전처리 함수 (rembg 사용)
def preprocess_image(image):
    try:
        # rembg를 사용하여 배경 제거
        print("rembg를 사용하여 배경 제거 중...")
        result_image = remove(image)
        print("배경 제거 완료")

        # PIL 이미지로 반환
        return Image.fromarray(np.array(result_image))
    except Exception as e:
        print("preprocess_image 함수에서 오류 발생:")
        traceback.print_exc()
        raise e


# 데이터베이스에서 임베딩 데이터 검색 함수
def search_similar_embeddings(query_embedding, top_n=5):
    # 데이터베이스 연결
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            # 모든 임베딩 벡터와 이미지 URL을 가져오는 쿼리 (임베딩은 JSON 형식으로 저장되어 있음)
            sql = "SELECT pet_num, embedding_data, pet_img FROM pet_info"
            cursor.execute(sql)
            results = cursor.fetchall()

            # 유사도 계산을 위한 리스트
            similarities = []

            for pet_num, embedding_data, pet_img in results:
                # 데이터베이스에서 가져온 임베딩을 NumPy 배열로 변환
                db_embedding = np.array(json.loads(embedding_data)).flatten()

                # 임베딩 벡터 정규화
                db_embedding = db_embedding / np.linalg.norm(db_embedding)

                # 코사인 유사도 계산
                cosine_similarity = np.dot(query_embedding, db_embedding) / (
                        np.linalg.norm(query_embedding) * np.linalg.norm(db_embedding)
                )
                similarities.append({"pet_num": pet_num, "pet_img": pet_img, "cosine_similarity": cosine_similarity})

            # 유사도 기준으로 상위 n개 선택
            similarities = sorted(similarities, key=lambda x: x["cosine_similarity"], reverse=True)[:top_n]
            return [
                {
                    "pet_num": similarity["pet_num"],
                    "pet_img": similarity["pet_img"],
                    "cosine_similarity": float(similarity["cosine_similarity"])
                }
                for similarity in similarities
            ]

    finally:
        connection.close()


# 3. API 엔드포인트 정의
# LangChain을 사용하여 대화를 처리하는 엔드포인트
@app.post("/openai/chat")
async def chat_with_openai(request: QuestionRequest):
    try:
        chain = get_conversation_chain(request.user_id)
        result = chain.invoke({"input": request.input})
        return {"response": result['response']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 텍스트 임베딩 생성 후 유사한 이미지 검색 API 엔드포인트 추가
@app.post("/search_by_text")
async def search_by_text(request: TextEmbeddingRequest):
    try:
        # 텍스트 임베딩 생성
        text_embedding = generate_text_embedding(request.text)
        # 유사한 이미지 검색
        similar_pets = search_similar_embeddings(text_embedding, top_n=5)
        return {"similar_pets": similar_pets}
    except Exception as e:
        print("search_by_text 함수에서 오류 발생:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# 이미지 임베딩 생성 후 유사한 이미지 검색 API 엔드포인트 추가
@app.post("/search_by_image")
async def search_by_image(file: UploadFile = File(...)):
    try:
        # 이미지 파일을 PIL 이미지로 변환
        print("이미지 파일 읽는 중...")
        image = Image.open(io.BytesIO(await file.read()))
        print("이미지 파일 읽기 완료")

        # 이미지 전처리 (배경 제거)
        print("이미지 전처리 중...")
        preprocessed_image = preprocess_image(image)
        print("이미지 전처리 완료")

        # 이미지 임베딩 생성
        print("이미지 임베딩 생성 중...")
        image_embedding = generate_image_embedding(preprocessed_image)
        print("이미지 임베딩 생성 완료")

        # 유사한 이미지 검색
        print("유사한 이미지 검색 중...")
        similar_pets = search_similar_embeddings(image_embedding, top_n=5)
        print("유사한 이미지 검색 완료")

        return {"similar_pets": similar_pets}
    except Exception as e:
        print("search_by_image 함수에서 오류 발생:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# FastAPI 실행 설정
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

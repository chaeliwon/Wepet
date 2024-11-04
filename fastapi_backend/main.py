from fastapi import FastAPI, HTTPException, File, UploadFile
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from langchain_utils import get_conversation_chain, extract_keywords
from clip_embedding import generate_text_embedding, generate_image_embedding, preprocess_image
from db_search import search_similar_embeddings, search_by_keywords
import traceback
import io
from PIL import Image
import time

# FastAPI 앱 생성
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 허용할 출처 목록
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메서드를 허용
    allow_headers=["*"],  # 모든 헤더를 허용
)

# 요청 모델 정의
class QuestionRequest(BaseModel):
    user_id: str
    input: str

class TextEmbeddingRequest(BaseModel):
    text: str

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
from fastapi import HTTPException

embedding_cache = {}


@app.post("/search_by_text")
async def search_by_text(request: TextEmbeddingRequest):
    try:
        # 키워드 추출 및 번역
        keywords = extract_keywords(request.text)
        print(f"추출된 키워드 리스트: {keywords}")

        # 키워드가 None이거나 빈 리스트인 경우 예외 발생
        if not keywords:
            print("키워드 추출 실패: 키워드를 찾을 수 없습니다.")
            raise ValueError("키워드 추출 실패: 키워드를 찾을 수 없습니다.")

        # 번역된 키워드를 결합하여 캐시 키 생성
        keyword_text = " ".join(keywords)

        # 캐시 확인: 동일한 키워드로 생성된 임베딩이 있는지 확인
        if keyword_text not in embedding_cache:
            embedding_cache[keyword_text] = generate_text_embedding(keyword_text)

        # 임베딩 가져오기
        text_embedding = embedding_cache[keyword_text]
        print(f"생성된 텍스트 임베딩: {text_embedding[:5]}...")

        # 생성된 임베딩을 사용하여 유사도 검색
        similar_pets = search_by_keywords(text_embedding, top_n=5)
        print(f"검색 결과: {similar_pets}")

        return {"similar_pets": similar_pets}

    except Exception as e:
        print("search_by_text 함수에서 오류 발생:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"서버 오류: {str(e)}")


# 이미지 임베딩 생성 후 유사한 이미지 검색 API 엔드포인트 추가
@app.post("/search_by_image")
async def search_by_image(file: UploadFile = File(...)):
    try:
        print("이미지 파일 읽는 중...")
        start_time_total = time.time()
        image = Image.open(io.BytesIO(await file.read()))
        print("이미지 파일 읽기 완료")

        print("이미지 전처리 중...")
        preprocessed_image = preprocess_image(image)
        print("이미지 전처리 완료")

        print("이미지 임베딩 생성 중...")
        image_embedding = generate_image_embedding(preprocessed_image)
        print("이미지 임베딩 생성 완료")

        print("유사한 이미지 검색 중...")
        similar_pets = search_similar_embeddings(image_embedding, top_n=5)
        print("유사한 이미지 검색 완료")

        end_time_total = time.time()
        print(f"search_by_image 전체 실행 시간: {end_time_total - start_time_total:.2f}초")

        return {"similar_pets": similar_pets}
    except Exception as e:
        print("search_by_image 함수에서 오류 발생:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# FastAPI 실행 설정
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

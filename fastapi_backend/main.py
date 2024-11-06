from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_utils import get_conversation_chain, extract_keywords
from clip_embedding import generate_text_embedding, generate_image_embedding, preprocess_image
from db_search import search_similar_embeddings, search_by_keywords
import traceback
import io
from PIL import Image
import time
from mangum import Mangum

# FastAPI 앱 생성
app = FastAPI()

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            "body": {"response": result['response']}
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            "body": {"error": str(e)}
        }

# 텍스트 임베딩 생성 후 유사한 이미지 검색 API 엔드포인트
@app.post("/search_by_text")
async def search_by_text(request: TextEmbeddingRequest):
    try:
        keywords = extract_keywords(request.text)
        print(f"추출된 키워드 리스트: {keywords}")

        if not keywords:
            print("키워드 추출 실패: 키워드를 찾을 수 없습니다.")
            raise ValueError("키워드 추출 실패: 키워드를 찾을 수 없습니다.")

        keyword_text = " ".join(keywords)
        text_embedding = generate_text_embedding(keyword_text)
        print(f"생성된 텍스트 임베딩: {text_embedding[:5]}...")

        similar_pets = search_by_keywords(text_embedding, top_n=5)
        print(f"검색 결과: {similar_pets}")

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            "body": {"similar_pets": similar_pets}
        }
    except Exception as e:
        print("search_by_text 함수에서 오류 발생:")
        traceback.print_exc()
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            "body": {"error": str(e)}
        }

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

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            "body": {"similar_pets": similar_pets}
        }
    except Exception as e:
        print("search_by_image 함수에서 오류 발생:")
        traceback.print_exc()
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            "body": {"error": str(e)}
        }

# chat 엔드포인트용 OPTIONS 요청 처리
@app.options("/openai/chat")
async def options_chat():
    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "http://localhost:3000",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,POST"
        }
    }

# text 검색 엔드포인트용 OPTIONS 요청 처리
@app.options("/search_by_text")
async def options_search_by_text():
    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "http://localhost:3000",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,POST"
        }
    }

# 이미지 검색 엔드포인트용 OPTIONS 요청 처리
@app.options("/search_by_image")
async def options_search_by_image():
    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "http://localhost:3000",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,POST"
        }
    }

# Mangum 핸들러
handler = Mangum(app)
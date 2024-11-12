from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_utils import analyze_pet_behavior, extract_keywords
from clip_embedding import generate_text_embedding, generate_image_embedding, preprocess_image
from db_search import search_similar_embeddings, search_by_keywords
import traceback
import io
from PIL import Image
from mangum import Mangum
from fastapi.responses import JSONResponse

# FastAPI 앱 생성
app = FastAPI()

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://main.d2agnx57wvpluz.amplifyapp.com",
        "http://localhost:3000"
    ],
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
async def chat_with_openai(
        user_id: str = Form(...),
        input: str = Form(...)
):
    try:
        result = await analyze_pet_behavior(user_id, input)
        return JSONResponse(status_code=200, content={"response": result})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# 텍스트 임베딩 생성 후 유사한 이미지 검색 API 엔드포인트
@app.post("/search_by_text")
async def search_by_text(request: TextEmbeddingRequest):
    try:
        keywords = extract_keywords(request.text)
        if not keywords:
            raise ValueError("키워드 추출 실패: 키워드를 찾을 수 없습니다.")
        keyword_text = " ".join(keywords)
        text_embedding = generate_text_embedding(keyword_text)
        similar_pets = search_by_keywords(text_embedding, top_n=5)
        return {"similar_pets": similar_pets}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# 이미지 임베딩 생성 후 유사한 이미지 검색 API 엔드포인트
@app.post("/search_by_image")
async def search_by_image(file: UploadFile = File(...)):
    try:
        image = Image.open(io.BytesIO(await file.read()))
        preprocessed_image = preprocess_image(image)
        image_embedding = generate_image_embedding(preprocessed_image)
        similar_pets = search_similar_embeddings(image_embedding, top_n=5)
        return {"similar_pets": similar_pets}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# Mangum 핸들러
handler = Mangum(app)

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from dotenv import load_dotenv
import os

load_dotenv()  # .env 파일에서 환경 변수 불러오기

openai_api_key = os.getenv("OPENAI_API_KEY")

# FastAPI 앱 생성
app = FastAPI()

# Langchain 설정
llm_model = ChatOpenAI(model_name="gpt-4o-mini", temperature=0.5, max_tokens=500)

# 프롬프트 설정
prompt = PromptTemplate.from_template(
    "당신은 애완동물 추천을 기가막히게 잘합니다! 사람들의 말속에서 키워드를 쏙쏙 뽑아내서 강아지를 추천해주죠! "
    "말끝에 멍! 을 붙일거에요. 이전 대화: {history} 새로운 질문: {input}"
)

# 메모리 기능 추가
memory = ConversationBufferMemory(return_messages=True)

# 체인 설정
chain = ConversationChain(llm=llm_model, memory=memory, prompt=prompt)

# 요청 모델 정의
class QuestionRequest(BaseModel):
    input: str

# API 엔드포인트 정의
@app.post("/openai/chat")
async def chat_with_openai(request: QuestionRequest):
    try:
        # Langchain을 이용해 사용자 질문 처리
        result = chain.invoke({"input": request.input})
        return {"response": result['response']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

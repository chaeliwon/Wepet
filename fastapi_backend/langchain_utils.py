from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from dotenv import load_dotenv
import os
import time
import traceback
from fastapi import HTTPException

# .env 파일 로드
load_dotenv()

# 환경 변수에서 OPENAI_API_KEY 불러오기
openai_api_key = os.getenv("OPENAI_API_KEY")

# Langchain 설정
llm_model = ChatOpenAI(api_key=openai_api_key, model_name="gpt-4o-mini", temperature=0.5, max_tokens=500)

# 프롬프트 설정
prompt = PromptTemplate.from_template(
    "당신은 애완동물을 추천하기위해 사람들과 대화합니다. 사람들의 대화에서 원하고있는 동물의 키워드를 뽑아낼거에요. 대답을 할때에 사람들의 말속에서 키워드를 뽑아 나열해 대답합니다. 당신이 뽑아낸 데이터는 임베딩하는 api에 전달될것입니다 "
    "말끝에 알았다 멍! 을 붙일거에요. 이전 대화: {history} 새로운 질문: {input}"
)

# 사용자별 메모리 저장 딕셔너리
user_memories = {}

# 사용자별 메모리 생성 및 체인 생성 함수
def get_conversation_chain(user_id):
    if user_id not in user_memories:
        user_memories[user_id] = ConversationBufferMemory(return_messages=True)
    user_memory = user_memories[user_id]
    return ConversationChain(llm=llm_model, memory=user_memory, prompt=prompt)

# GPT를 사용하여 키워드 추출 및 영어 번역 함수
def extract_keywords(text):
    try:
        start_time = time.time()

        # GPT 프롬프트 생성 (한국어 키워드 추출 및 영어 번역 요청)
        prompt = f"다음 문장에서 키워드만 추출하여 영어로 번역해주세요. 키워드는 털색, 견종, 크기와 관련된 단어들입니다. 예: 흰색 고양이 -> white, cat 문장: {text}"
        response = llm_model.invoke(prompt)

        # Response가 리스트 또는 객체일 수 있으므로 이를 확인하여 처리
        response_text = response[0].content.strip() if isinstance(response, list) else response.content.strip()

        print(f"추출된 및 번역된 키워드: {response_text}")

        # 콤마로 구분된 키워드를 리스트로 변환
        translated_keywords = response_text.split(', ')

        end_time = time.time()
        print(f"extract_keywords 함수 실행 시간: {end_time - start_time:.2f}초")
        print(f"번역된 키워드: {translated_keywords}")

        return translated_keywords

    except Exception as e:
        print("extract_keywords 함수에서 오류 발생:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"키워드 추출 실패: {str(e)}")



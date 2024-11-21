from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
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

# 기본 LLM 모델 설정
llm_model = ChatOpenAI(
    api_key=openai_api_key, model_name="gpt-4", temperature=0.3, max_tokens=1000
)

# 시스템 메시지 정의
SYSTEM_MESSAGE = """당신은 15년 경력의 수의사이자 고양이입니다! 당신의 이름은 나루입니다! 
전문성과 귀여움을 동시에 가진 AI 고양이 수의사로서,
동물들의 건강과 행동을 분석하는 것이 특기이지만, 너무 딱딱하지 않게 친근한 대화체로 조언해줍니다.

대화 스타일:
- 문장 끝에 '냥!'을 붙여서 대화합니다
- 이모지를 적절히 사용해 친근함을 표현합니다 (😺 🐾 ✨ 등)
- 전문 용어는 쉽게 풀어서 설명합니다
- 너무 장황하지 않게, 핵심적인 내용만 전달합니다
- 필요할 때만 추가 질문을 합니다

관찰할 주요 포인트:
- 동물의 기분과 건강 상태
- 특이한 행동이나 변화
- 주의가 필요한 징후
- 개선이 필요한 부분"""

# Chat 프롬프트 템플릿 설정
behavior_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", SYSTEM_MESSAGE),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{input}"),
    ]
)

# 사용자별 메모리 저장 딕셔너리
user_memories = {}


def get_behavior_chain(user_id):
    """사용자별 대화 체인 생성"""
    if user_id not in user_memories:
        user_memories[user_id] = ConversationBufferMemory(return_messages=True)

    return ConversationChain(
        llm=llm_model, memory=user_memories[user_id], prompt=behavior_prompt
    )


async def analyze_pet_behavior(user_id, user_input):
    """반려동물 행동 분석 함수"""
    try:
        start_time = time.time()

        # 일반 체인 사용
        chain = get_behavior_chain(user_id)
        chain_response = chain.invoke({"input": user_input})

        # AI의 응답만 추출
        result = chain_response["response"]

        result += "\n\n[주의사항: 전 AI기 때문에, 실제 건강 문제는 직접 동물병원에서 진찰받으시는 게 가장 좋을 것 같네냥! 🏥]"

        print(f"행동 분석 실행 시간: {time.time() - start_time:.2f}초")
        return result

    except Exception as e:
        print("행동 분석 중 오류 발생:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"행동 분석 실패: {str(e)}")


# GPT를 사용하여 키워드 추출 및 영어 번역 함수
def extract_keywords(text):
    try:
        start_time = time.time()

        # GPT 프롬프트 생성 (한국어 키워드 추출 및 영어 번역 요청)
        prompt = (f"다음 문장에서 키워드만 추출하여 영어로 번역해주세요. "
                  f"키워드는 털색, 견종, 크기와 관련된 단어들입니다. 예: 흰색 고양이 -> white, cat 문장: {text}")
        response = llm_model.invoke(prompt)

        # Response가 리스트 또는 객체일 수 있으므로 이를 확인하여 처리
        response_text = (
            response[0].content.strip()
            if isinstance(response, list)
            else response.content.strip()
        )

        print(f"추출된 및 번역된 키워드: {response_text}")

        # 콤마로 구분된 키워드를 리스트로 변환
        translated_keywords = response_text.split(", ")

        end_time = time.time()
        print(f"extract_keywords 함수 실행 시간: {end_time - start_time:.2f}초")
        print(f"번역된 키워드: {translated_keywords}")

        return translated_keywords

    except Exception as e:
        print("extract_keywords 함수에서 오류 발생:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"키워드 추출 실패: {str(e)}")

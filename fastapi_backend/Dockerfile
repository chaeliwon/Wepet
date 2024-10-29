# Python 3.12 베이스 이미지 사용
FROM python:3.12

# 작업 디렉토리 설정
WORKDIR /app

# requirements.txt 파일을 복사하고 패키지 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 나머지 애플리케이션 파일 복사
COPY . .

# FastAPI 서버 실행
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

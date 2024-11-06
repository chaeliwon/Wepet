# ARM 아키텍처 최적화 이미지 사용
FROM public.ecr.aws/lambda/nodejs:20-arm64

# 작업 디렉터리 설정
WORKDIR /var/task

# 모든 파일을 복사하고, 의존성 설치
COPY . .
RUN npm install

# Lambda 핸들러로 설정
CMD ["server.handler"]

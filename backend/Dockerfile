# # ARM 아키텍처 최적화 이미지 사용
# FROM public.ecr.aws/lambda/nodejs:20-arm64

# # 작업 디렉터리 설정
# WORKDIR /var/task

# # 모든 파일을 복사하고, 의존성 설치
# COPY . .
# RUN npm install

# # Lambda 핸들러로 설정
# CMD ["server.handler"]

# ARM 아키텍처 최적화 이미지 사용
FROM public.ecr.aws/lambda/nodejs:20-arm64

# 작업 디렉터리 설정
WORKDIR /var/task

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 필요한 폴더와 파일 복사
COPY config ./config
COPY controllers ./controllers
COPY routes ./routes
COPY server.js ./

# Lambda 핸들러로 설정
CMD ["server.handler"]

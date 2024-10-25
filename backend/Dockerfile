# 1. Lambda Node.js 14.x 런타임 이미지 사용
FROM public.ecr.aws/lambda/nodejs:14

# 2. 작업 디렉터리 설정
WORKDIR /app

# 3. package.json과 package-lock.json 복사
COPY package*.json ./

# 4. 의존성 설치
RUN npm install --production

# 5. 애플리케이션 소스 코드 복사
COPY . .

# 6. Lambda 핸들러를 호출하도록 CMD 설정
CMD ["app.handler"]

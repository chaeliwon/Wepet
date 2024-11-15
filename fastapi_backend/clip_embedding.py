import torch
from transformers import CLIPProcessor, CLIPModel
import numpy as np
import time
from PIL import Image
from rembg.bg import remove

# CLIP 모델 및 프로세서 로드
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")


embedding_cache = {}

# CLIP을 이용한 텍스트 임베딩 생성 함수
def generate_text_embedding(text):
    # 캐시를 사용하여 중복 생성을 방지
    if text in embedding_cache:
        return embedding_cache[text]

    start_time = time.time()
    # 텍스트 임베딩 생성
    inputs = clip_processor(text=[text], return_tensors="pt")
    with torch.no_grad():
        text_embedding = clip_model.get_text_features(**inputs).cpu().numpy()

    # L2 정규화
    text_embedding /= np.linalg.norm(text_embedding, axis=1, keepdims=True) + 1e-10

    embedding_cache[text] = text_embedding.flatten().tolist()  # 캐시에 저장
    print("텍스트 임베딩 생성 완료")
    print(f"generate_text_embedding 함수 실행 시간: {time.time() - start_time:.2f}초")

    return embedding_cache[text]


# CLIP을 이용한 이미지 임베딩 생성 함수
def generate_image_embedding(image):
    start_time = time.time()
    inputs = clip_processor(images=image, return_tensors="pt").to("cpu")
    with torch.no_grad():
        image_embedding = clip_model.get_image_features(**inputs).cpu().numpy()
    image_embedding = image_embedding / (
        np.linalg.norm(image_embedding, axis=1, keepdims=True) + 1e-10
    )
    print("이미지 임베딩 생성 완료")
    end_time = time.time()
    print(f"generate_image_embedding 함수 실행 시간: {end_time - start_time:.2f}초")
    return image_embedding.flatten().tolist()


# 이미지 전처리 함수 (rembg 사용)
def preprocess_image(image):
    try:
        start_time = time.time()
        print("rembg를 사용하여 배경 제거 중...")
        result_image = remove(image)
        print("배경 제거 완료")
        end_time = time.time()
        print(f"preprocess_image 함수 실행 시간: {end_time - start_time:.2f}초")
        return Image.fromarray(np.array(result_image))
    except Exception as e:
        print(f"preprocess_image 함수에서 오류 발생: {e}")
        raise e  # 예외를 다시 발생시켜 호출자에게 전달

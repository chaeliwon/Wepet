import json
import numpy as np
from db import get_database_connection
import time


# 데이터베이스에서 임베딩 데이터 검색 함수
def search_similar_embeddings(query_embedding, top_n=5):
    start_time = time.time()
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            sql = "SELECT pet_num, embedding_data, pet_img FROM pet_info"
            cursor.execute(sql)
            results = cursor.fetchall()

            similarities = []

            for pet_num, embedding_data, pet_img in results:
                db_embedding = np.array(json.loads(embedding_data)).flatten()
                norm = np.linalg.norm(db_embedding)
                if norm == 0:
                    print("경고: 임베딩 벡터의 정규화 값이 0입니다. 스킵합니다.")
                    continue
                db_embedding = db_embedding / (norm + 1e-10)
                cosine_similarity = np.dot(query_embedding, db_embedding) / (
                    np.linalg.norm(query_embedding) * np.linalg.norm(db_embedding)
                    + 1e-10
                )
                similarities.append(
                    {
                        "pet_num": pet_num,
                        "pet_img": pet_img,
                        "cosine_similarity": cosine_similarity,
                    }
                )

            if similarities:
                similarities = sorted(
                    similarities, key=lambda x: x["cosine_similarity"], reverse=True
                )[:top_n]
            print(f"유사도 계산 완료: {similarities}")
            return [
                {
                    "pet_num": similarity["pet_num"],
                    "pet_img": similarity["pet_img"],
                    "cosine_similarity": float(similarity["cosine_similarity"]),
                }
                for similarity in similarities
            ]
    finally:
        connection.close()
        end_time = time.time()
        print(
            f"search_similar_embeddings 함수 실행 시간: {end_time - start_time:.2f}초"
        )


# search_by_keywords 함수 내 필터링 로직 적용
# 키워드 기반 검색 함수
def search_by_keywords(text_embedding, top_n=5):
    start_time = time.time()
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            # 데이터베이스에서 임베딩 데이터와 함께 가져오기
            sql = "SELECT pet_num, embedding_data, pet_img FROM pet_info"
            cursor.execute(sql)
            results = cursor.fetchall()

        similarities = []
        for pet_num, embedding_data, pet_img in results:
            # 데이터베이스의 임베딩 데이터를 로드하고 정규화
            db_embedding = np.array(json.loads(embedding_data)).flatten()
            db_embedding = db_embedding / (np.linalg.norm(db_embedding) + 1e-10)

            # 코사인 유사도 계산
            cosine_similarity = np.dot(text_embedding, db_embedding)
            cosine_similarity /= (
                np.linalg.norm(text_embedding) * np.linalg.norm(db_embedding) + 1e-10
            )

            similarities.append(
                {
                    "pet_num": pet_num,
                    "pet_img": pet_img,
                    "cosine_similarity": cosine_similarity,
                }
            )

        # 상위 n개의 결과 반환
        top_similarities = sorted(
            similarities, key=lambda x: x["cosine_similarity"], reverse=True
        )[:top_n]
        print(f"키워드 기반 유사도 계산 완료: {top_similarities}")

        return [
            {
                "pet_num": similarity["pet_num"],
                "pet_img": similarity["pet_img"],
                "cosine_similarity": float(similarity["cosine_similarity"]),
            }
            for similarity in top_similarities
        ]
    finally:
        connection.close()
        end_time = time.time()
        print(f"search_by_keywords 함수 실행 시간: {end_time - start_time:.2f}초")

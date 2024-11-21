from PIL import Image
import numpy as np
from sklearn.metrics import roc_curve, auc
import matplotlib.pyplot as plt
import json
from db import get_database_connection
from clip_embedding import preprocess_image, generate_image_embedding
import os


def get_validation_data():
    """검증용 로컬 이미지 데이터 가져오기"""
    validation_data = []
    validation_dir = "validation_images"

    for i in range(1, 11):  # 01 ~ 10
        image_path = os.path.join(validation_dir, f"{i:02d}.jpg")
        # 테스트용이므로 pet_num은 'test_{i}'로 설정
        validation_data.append((image_path, f"test_{i}"))

    return validation_data


def calculate_cosine_similarity(query_embedding, db_embedding):
    """
    코사인 유사도 계산 함수
    """
    # 벡터 정규화
    query_norm = np.linalg.norm(query_embedding)
    db_norm = np.linalg.norm(db_embedding)

    # 0으로 나누는 것을 방지
    if query_norm == 0 or db_norm == 0:
        return 0.0

    # 코사인 유사도 계산
    similarity = np.dot(query_embedding, db_embedding) / (query_norm * db_norm)

    # similarity 값이 0.9 이상인 경우에만 높은 점수 부여
    if similarity > 0.9:
        normalized_similarity = similarity
    else:
        normalized_similarity = similarity * 0.5  # 낮은 유사도는 더 낮게 조정

    return normalized_similarity


def analyze_single_image(image_path, test_id, db_connection):
    """단일 이미지 분석 및 디버깅 정보 출력"""
    try:
        print(f"\nAnalyzing test image: {image_path}")
        print(f"Test ID: {test_id}")

        # 이미지 로드 및 전처리
        image = Image.open(image_path)
        preprocessed_image = preprocess_image(image)
        query_embedding = generate_image_embedding(preprocessed_image)

        # 상위 5개의 유사도 점수 계산
        similarities = []
        with db_connection.cursor() as cursor:
            sql = "SELECT pet_num, embedding_data FROM pet_info"
            cursor.execute(sql)
            results = cursor.fetchall()

            for pet_num, embedding_data in results:
                db_embedding = np.array(json.loads(embedding_data)).flatten()
                similarity = calculate_cosine_similarity(query_embedding, db_embedding)
                similarities.append((pet_num, similarity))

        # 상위 5개 유사도 출력
        top_5 = sorted(similarities, key=lambda x: x[1], reverse=True)[:5]
        print("\nTop 5 similar images in database:")
        for pet_num, sim in top_5:
            print(f"Pet {pet_num}: {sim:.3f}")

        return query_embedding, similarities

    except Exception as e:
        print(f"Error in analyzing image: {str(e)}")
        return None, None


def calculate_roc_auroc(db_connection, validation_data):
    """ROC 곡선과 AUROC 수치를 계산하는 함수"""
    y_true = []
    y_scores = []

    print(f"Processing {len(validation_data)} validation images...")

    for image_path, test_id in validation_data:
        try:
            query_embedding, similarities = analyze_single_image(
                image_path, test_id, db_connection
            )
            if query_embedding is None:
                continue

            for pet_num, similarity in similarities:
                # 테스트 이미지는 데이터베이스에 없으므로 모두 0(불일치)으로 처리
                y_true.append(0)
                y_scores.append(similarity)

        except Exception as e:
            print(f"Error processing image {image_path}: {str(e)}")
            continue

    if not y_true or not y_scores:
        raise ValueError(
            "No valid predictions could be made. Check your validation data."
        )

    print("\nOverall Statistics:")
    print(f"Total predictions: {len(y_true)}")
    print("Similarity score distribution:")
    print(f"Min score: {min(y_scores):.3f}")
    print(f"Max score: {max(y_scores):.3f}")
    print(f"Mean score: {np.mean(y_scores):.3f}")
    print(f"Median score: {np.median(y_scores):.3f}")

    # ROC 곡선 계산
    fpr, tpr, thresholds = roc_curve(y_true, y_scores)
    roc_auc = auc(fpr, tpr)

    # ROC 곡선 그리기
    plt.figure(figsize=(10, 8))
    plt.plot(
        fpr, tpr, color="darkorange", lw=2, label=f"ROC curve (AUC = {roc_auc:.3f})"
    )
    plt.plot([0, 1], [0, 1], color="navy", lw=2, linestyle="--")
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title("Receiver Operating Characteristic (ROC) Curve")
    plt.legend(loc="lower right")
    plt.grid(True)

    # results 폴더 생성
    if not os.path.exists("results"):
        os.makedirs("results")

    # 결과 저장
    plt.savefig("results/roc_curve.png")
    plt.close()

    return roc_auc


def evaluate_threshold_performance(db_connection, validation_data, threshold=0.9):
    """특정 임계값에서의 모델 성능을 평가하는 함수"""
    metrics = {
        "true_positives": 0,  # 항상 0이어야 함 (테스트 이미지는 DB에 없음)
        "false_positives": 0,  # threshold 이상의 유사도를 가진 경우
        "true_negatives": 0,  # threshold 미만의 유사도를 가진 경우
        "false_negatives": 0,  # 항상 0이어야 함 (테스트 이미지는 DB에 없음)
    }

    for image_path, test_id in validation_data:
        try:
            image = Image.open(image_path)
            preprocessed_image = preprocess_image(image)
            query_embedding = generate_image_embedding(preprocessed_image)

            with db_connection.cursor() as cursor:
                sql = "SELECT pet_num, embedding_data FROM pet_info"
                cursor.execute(sql)
                results = cursor.fetchall()

                for pet_num, embedding_data in results:
                    db_embedding = np.array(json.loads(embedding_data)).flatten()
                    similarity = calculate_cosine_similarity(
                        query_embedding, db_embedding
                    )

                    # 테스트 이미지는 DB에 없으므로, threshold를 넘는 경우는 모두 false positive
                    if similarity >= threshold:
                        metrics["false_positives"] += 1
                    else:
                        metrics["true_negatives"] += 1

        except Exception as e:
            print(f"Error processing image {image_path}: {str(e)}")
            continue

    # 성능 지표 계산
    total_predictions = metrics["true_negatives"] + metrics["false_positives"]
    metrics["accuracy"] = (
        metrics["true_negatives"] / total_predictions if total_predictions > 0 else 0
    )

    return metrics


if __name__ == "__main__":
    # 데이터베이스 연결
    connection = get_database_connection()

    try:
        print("Getting validation data...")
        validation_data = get_validation_data()

        if not validation_data:
            print("No validation images found.")
            exit(1)

        print(f"Found {len(validation_data)} validation images")

        print("\nCalculating ROC curve and AUROC...")
        auroc = calculate_roc_auroc(connection, validation_data)
        print(f"AUROC: {auroc}")

        print("\nEvaluating model performance at threshold 0.9...")
        performance = evaluate_threshold_performance(
            connection, validation_data, threshold=0.9
        )

        print("\nModel Performance Metrics:")
        print(f"Accuracy: {performance['accuracy']:.3f}")

        print("\nDetailed Results:")
        print(f"True Negatives (Correct Rejections): {performance['true_negatives']}")
        print(f"False Positives (Incorrect Matches): {performance['false_positives']}")

    finally:
        connection.close()

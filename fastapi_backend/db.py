import pymysql

def get_database_connection():
    return pymysql.connect(
        host='project-db-stu3.smhrd.com',
        user='Insa5_JSB_final_3',
        password='aischool3',
        port=3307,
        database='Insa5_JSB_final_3'
    )
import psycopg2
import database.hash as hash

param = {
    'dbname': 'travelSmart',
    'user': 'postgres',
    'password': 'zoe984315',
    'host': 'localhost',
    'port': 5432
}
    

def reset_password(uname, pwd):
    try:
        conn = psycopg2.connect(**param)
        with conn.cursor() as cur:
            hashed_pwd = hash.hash_password(pwd)
            cur.execute("UPDATE \"user\".\"user\" SET password = %s WHERE username = %s;", (hashed_pwd, uname))
            conn.commit()
        return True
    except psycopg2.errors:
        return False
    finally:
        conn.close()


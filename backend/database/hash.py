import bcrypt


def hash_password(password):
    hashed = bcrypt.hashpw(password.encode(),bcrypt.gensalt(12))
    return hashed


def verify_password(password, db_password):
    return bcrypt.checkpw(password.encode(), db_password)



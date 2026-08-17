import os

from dotenv import load_dotenv
from passlib.context import CryptContext

from database import SessionLocal
from models import User

load_dotenv()

email = (os.getenv("ADMIN_EMAIL") or "").strip().lower()
password = os.getenv("ADMIN_PASSWORD") or ""

if not email or not password:
    raise SystemExit("ADMIN_EMAIL and ADMIN_PASSWORD are required")

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
db = SessionLocal()
try:
    user = db.query(User).filter(User.email == email).first()
    if user:
        user.password = pwd.hash(password)
        user.is_admin = True
    else:
        user = User(
            email=email,
            password=pwd.hash(password),
            phone=f"admin-{email}",
            name="ServiceHub Admin",
            is_admin=True,
        )
        db.add(user)
    db.commit()
    print(f"Admin ready: {email}")
finally:
    db.close()

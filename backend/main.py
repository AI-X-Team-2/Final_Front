# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# React 프론트에서 요청할 수 있도록 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/wrong-words")
def get_wrong_words():
    return {
        "words": ["사과", "바나나", "자동차", "하마", "기차", "학교", "시계", "커피", "의자", "강아지", "모자"]
    }

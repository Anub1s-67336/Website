"""
/api/quiz/{lesson_id}  — AI quiz generator via Gemini 1.5 Flash
Генерирует уникальные вопросы на основе текста урока.
Дедупликация через таблицу quiz_history (SHA-1 хеши вопросов).
"""
import os
import json
import hashlib
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text

import google.generativeai as genai

from ..database import get_db, Base, engine
from ..auth import verify_token
from ..models import User, Lesson
from .. import crud

router = APIRouter(tags=["quiz"])

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Создаём таблицу истории при первом запуске (если не существует)
def ensure_quiz_history_table():
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS quiz_history (
                user_id       INTEGER NOT NULL,
                lesson_id     INTEGER NOT NULL,
                question_hash TEXT    NOT NULL,
                asked_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, lesson_id, question_hash)
            )
        """))
        conn.commit()

ensure_quiz_history_table()

# ── Schemas ──────────────────────────────────────────────────────

class QuizQuestion(BaseModel):
    id: str
    question: str
    options: list[str]   # ровно 4 варианта
    correct_index: int   # 0–3
    explanation: str
    difficulty: int      # 1–3

class QuizResponse(BaseModel):
    lesson_id: int
    questions: list[QuizQuestion]

# ── Helpers ──────────────────────────────────────────────────────

def hash_question(question_text: str) -> str:
    """Детерминированный 12-символьный хеш текста вопроса."""
    return hashlib.sha1(question_text.lower().strip().encode()).hexdigest()[:12]

async def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Missing token")
    payload = verify_token(auth.split(" ")[1])
    if not payload:
        raise HTTPException(401, "Invalid token")
    user = crud.get_user_by_id(db, int(payload["sub"]))
    if not user:
        raise HTTPException(401, "User not found")
    return user

# ── Endpoint ─────────────────────────────────────────────────────

@router.get("/quiz/{lesson_id}", response_model=QuizResponse)
async def generate_quiz(
    lesson_id: int,
    count: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(404, "Lesson not found")

    # Хеши вопросов, которые этот пользователь уже видел по данному уроку
    rows = db.execute(
        text("SELECT question_hash FROM quiz_history WHERE user_id=:u AND lesson_id=:l"),
        {"u": current_user.id, "l": lesson_id},
    ).fetchall()
    seen_hashes: set[str] = {r[0] for r in rows}

    easy   = max(1, count // 3)
    medium = max(1, count // 3)
    hard   = count - easy - medium

    prompt = f"""На основе текста урока сгенерируй ровно {count} вопросов с вариантами ответов.

ТЕКСТ УРОКА:
Название: {lesson.title}
{lesson.description}

ТРЕБОВАНИЯ:
- Распределение сложности: {easy} лёгких (difficulty=1), {medium} средних (difficulty=2), {hard} сложных (difficulty=3)
- Все варианты ответов должны быть правдоподобными (не очевидно неправильными)
- Объяснение — одно краткое предложение с научным фактом
- НЕ повторяй вопросы с этими хешами (уже виденные учеником): {list(seen_hashes)[:30] or 'нет'}
- Язык вопросов: русский

Верни СТРОГО JSON-массив без markdown-обёртки:
[
  {{
    "question": "Текст вопроса?",
    "options": ["Вариант A", "Вариант B", "Вариант C", "Вариант D"],
    "correct_index": 0,
    "explanation": "Потому что...",
    "difficulty": 1
  }}
]"""

    # Gemini JSON-режим: response.text — готовая строка JSON (без ```json```)
    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        generation_config=genai.types.GenerationConfig(
            response_mime_type="application/json",
            temperature=0.8,      # немного случайности для разнообразия вопросов
        ),
    )

    try:
        response = model.generate_content(prompt)
        questions_data: list[dict] = json.loads(response.text)
    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(500, f"AI вернул невалидный JSON: {e}")
    except Exception as e:
        raise HTTPException(502, f"Ошибка Gemini API: {e}")

    questions: list[QuizQuestion] = []
    new_hashes: list[str] = []

    for q in questions_data[:count]:
        qid = hash_question(q.get("question", ""))
        questions.append(QuizQuestion(
            id=qid,
            question=q["question"],
            options=q["options"][:4],           # не больше 4 вариантов
            correct_index=int(q["correct_index"]),
            explanation=q.get("explanation", ""),
            difficulty=int(q.get("difficulty", 1)),
        ))
        if qid not in seen_hashes:
            new_hashes.append(qid)

    # Сохраняем новые хеши — при следующем запросе эти вопросы не повторятся
    for h in new_hashes:
        db.execute(
            text("""
                INSERT OR IGNORE INTO quiz_history (user_id, lesson_id, question_hash)
                VALUES (:u, :l, :h)
            """),
            {"u": current_user.id, "l": lesson_id, "h": h},
        )
    db.commit()

    return QuizResponse(lesson_id=lesson_id, questions=questions)

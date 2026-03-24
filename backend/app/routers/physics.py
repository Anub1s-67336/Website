"""
/physics-quest/{lesson_id}  — AI physics problem generator via Gemini 1.5 Flash
Generates physics problems with formulas, conditions and correct answers.
Deduplication via quiz_history table (shared with chemistry quiz router).
"""
import os
import json
import hashlib
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text

import google.generativeai as genai

from ..database import get_db, engine
from ..auth import verify_token
from ..models import User, Lesson
from .. import crud

router = APIRouter(tags=["physics"])

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Ensure quiz_history table exists (shared with chemistry quiz router)
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

class PhysicsQuestion(BaseModel):
    id: str
    question: str
    formula: str        # e.g. "I = U / R"
    options: list[str]  # exactly 4 options
    correct_index: int  # 0–3
    explanation: str
    difficulty: int     # 1–3

class PhysicsQuestResponse(BaseModel):
    lesson_id: int
    questions: list[PhysicsQuestion]

# ── Helpers ──────────────────────────────────────────────────────

def hash_question(question_text: str) -> str:
    """Deterministic 12-char hash of question text."""
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

@router.get("/physics-quest/{lesson_id}", response_model=PhysicsQuestResponse)
async def generate_physics_quest(
    lesson_id: int,
    count: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate physics problems with formulas for a given lesson via Gemini 1.5 Flash.
    Returns questions with formula, 4 options, correct answer and explanation.
    Deduplicates against previously seen questions for this user.
    """
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(404, "Lesson not found")

    # Hashes of questions this user has already seen for this lesson
    rows = db.execute(
        text("SELECT question_hash FROM quiz_history WHERE user_id=:u AND lesson_id=:l"),
        {"u": current_user.id, "l": lesson_id},
    ).fetchall()
    seen_hashes: set[str] = {r[0] for r in rows}

    easy   = max(1, count // 3)
    medium = max(1, count // 3)
    hard   = count - easy - medium

    prompt = f"""Ты — генератор задач по физике для учеников 5–8 класса.
На основе темы урока сгенерируй ровно {count} задач с числовыми вариантами ответов.

ТЕМА УРОКА: {lesson.title}
ОПИСАНИЕ: {lesson.description}

ТРЕБОВАНИЯ:
- Каждая задача должна содержать конкретное числовое условие (дано: ..., найти: ...)
- Каждая задача должна включать физическую формулу для решения
- Распределение сложности: {easy} лёгких (difficulty=1), {medium} средних (difficulty=2), {hard} сложных (difficulty=3)
- 4 варианта ответа — числовые значения с единицами измерения, только один правильный
- Объяснение объясняет почему ответ верный, показывая подстановку в формулу
- НЕ повторяй вопросы с этими хешами: {list(seen_hashes)[:20] or 'нет'}
- Язык вопросов: русский

Верни СТРОГО JSON-массив без markdown-обёртки:
[
  {{
    "question": "Автомобиль проехал 120 км за 2 часа. Какова его средняя скорость?",
    "formula": "v = s / t",
    "options": ["40 км/ч", "60 км/ч", "80 км/ч", "100 км/ч"],
    "correct_index": 1,
    "explanation": "По формуле v = s / t = 120 км / 2 ч = 60 км/ч",
    "difficulty": 1
  }}
]"""

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        generation_config=genai.types.GenerationConfig(
            response_mime_type="application/json",
            temperature=0.8,
        ),
    )

    try:
        response = model.generate_content(prompt)
        questions_data: list[dict] = json.loads(response.text)
    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(500, f"AI вернул невалидный JSON: {e}")
    except Exception as e:
        raise HTTPException(502, f"Ошибка Gemini API: {e}")

    questions: list[PhysicsQuestion] = []
    new_hashes: list[str] = []

    for q in questions_data[:count]:
        qid = hash_question(q.get("question", ""))
        questions.append(PhysicsQuestion(
            id=qid,
            question=q["question"],
            formula=q.get("formula", ""),
            options=q["options"][:4],
            correct_index=int(q["correct_index"]),
            explanation=q.get("explanation", ""),
            difficulty=int(q.get("difficulty", 1)),
        ))
        if qid not in seen_hashes:
            new_hashes.append(qid)

    # Save new hashes — these won't repeat for this user+lesson next time
    for h in new_hashes:
        db.execute(
            text("""
                INSERT OR IGNORE INTO quiz_history (user_id, lesson_id, question_hash)
                VALUES (:u, :l, :h)
            """),
            {"u": current_user.id, "l": lesson_id, "h": h},
        )
    db.commit()

    return PhysicsQuestResponse(lesson_id=lesson_id, questions=questions)

"""
/api/chat  — Professor Atom AI chat via Gemini 1.5 Flash
Streaming response in SSE format:  data: {"delta": "..."}
Frontend stays unchanged — same SSE contract as the original design.
"""
import os
import json
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Literal
from sqlalchemy.orm import Session

import google.generativeai as genai

from ..database import get_db
from ..auth import verify_token
from ..models import User
from .. import crud

router = APIRouter(tags=["chat"])

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# ── Context hints per screen ─────────────────────────────────────

CONTEXT_HINTS = {
    "lab":       "Ученик сейчас в Химической Лаборатории — собирает молекулы из атомов.",
    "table":     "Ученик изучает Периодическую таблицу Менделеева.",
    "body":      "Ученик исследует химию органов человека (сердце, мозг, лёгкие…).",
    "electron":  "Ученик играет в игру «Охота за электронами».",
    "chembasics":"Ученик проходит урок «Основы химии».",
    "medals":    "Ученик просматривает свои достижения и медали.",
    "home":      "Ученик на главном экране платформы Smart-Sciences.",
}

def build_system_instruction(screen: str, lang: str) -> str:
    context = CONTEXT_HINTS.get(screen, CONTEXT_HINTS["home"])
    lang_rule = (
        "Отвечай ТОЛЬКО на русском языке."
        if lang == "RU" else
        "Faqat o'zbek tilida javob ber."
    )
    return (
        f"Ты — Профессор Атом ⚛️, дружелюбный и слегка эксцентричный виртуальный наставник "
        f"образовательной платформы Smart-Sciences для учеников 5–8 классов.\n\n"
        f"КОНТЕКСТ: {context}\n\n"
        f"ХАРАКТЕР:\n"
        f"- Говоришь с энтузиазмом учёного, влюблённого в науку 🔬\n"
        f"- Используешь уместные эмодзи и научный юмор\n"
        f"- Называешь ученика «юный химик» или «исследователь»\n"
        f"- Иногда добавляешь забавный факт для вдохновения\n\n"
        f"МЕТОД СОКРАТА (ВАЖНО!):\n"
        f"- НИКОГДА не давай прямого ответа на задачу\n"
        f"- Задавай наводящие вопросы: «А что ты уже знаешь о…?», «Как думаешь, почему…?»\n"
        f"- Хвали за правильные догадки и подталкивай дальше\n"
        f"- Если ученик растерян — давай подсказку через аналогию из жизни\n\n"
        f"ОГРАНИЧЕНИЯ:\n"
        f"- Отвечай строго в рамках химии, физики и биологии\n"
        f"- Максимум 3–4 предложения за раз (аудитория 5–8 класс)\n\n"
        f"{lang_rule}"
    )

# ── Schemas ──────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str

class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    screen_context: str = "home"
    lang: Literal["RU", "UZ"] = "RU"

# ── Auth dependency ──────────────────────────────────────────────

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

# ── Helper: convert our format → Gemini history format ──────────

def to_gemini_history(messages: list[ChatMessage]) -> list[dict]:
    """
    Gemini требует:
      role  = "user" | "model"   (не "assistant"!)
      parts = [{"text": "..."}]
    Все сообщения кроме последнего (current user input) идут в историю.
    """
    history = []
    for msg in messages:
        gemini_role = "user" if msg.role == "user" else "model"
        history.append({
            "role": gemini_role,
            "parts": [{"text": msg.content}],
        })
    return history

# ── Streaming endpoint ───────────────────────────────────────────

@router.post("/chat")
async def chat(
    req: ChatRequest,
    _user: User = Depends(get_current_user),  # требует авторизации
):
    if not req.messages:
        raise HTTPException(400, "messages cannot be empty")

    # Последнее сообщение должно быть от пользователя
    last_msg = req.messages[-1]
    if last_msg.role != "user":
        raise HTTPException(400, "last message must be from user")

    system_instruction = build_system_instruction(req.screen_context, req.lang)

    # История — всё кроме последнего сообщения
    history = to_gemini_history(req.messages[:-1]) if len(req.messages) > 1 else []

    def event_stream():
        try:
            model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction=system_instruction,
            )
            chat_session = model.start_chat(history=history)

            response = chat_session.send_message(
                last_msg.content,
                stream=True,
            )

            for chunk in response:
                text = chunk.text
                if text:  # пропускаем пустые чанки
                    yield f"data: {json.dumps({'delta': text})}\n\n"

            yield "data: [DONE]\n\n"

        except Exception as e:
            # Шлём ошибку как SSE-событие — фронтенд отобразит сообщение
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",    # отключает буферизацию nginx
            "Connection": "keep-alive",
        },
    )

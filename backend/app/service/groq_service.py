import json
from typing import TypeVar

from groq import Groq
from pydantic import BaseModel

from app.config.settings import GROQ_API_KEY, GROQ_MODEL

client = Groq(api_key=GROQ_API_KEY)

T = TypeVar("T", bound=BaseModel)


def ask_groq(prompt: str, response_model: type[T]) -> T:
    """Ask Groq for a JSON response validated against a Pydantic model."""

    schema = response_model.model_json_schema()

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a product discovery assistant. "
                    "Follow the user's instructions exactly. "
                    "Return valid JSON only. "
                    "Never invent product specifications or suppliers."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"{prompt}\n\n"
                    "Return a JSON object matching this schema:\n"
                    f"{json.dumps(schema)}"
                ),
            },
        ],
        temperature=0.1,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content

    if not content:
        raise RuntimeError("Groq returned an empty response.")

    return response_model.model_validate_json(content)
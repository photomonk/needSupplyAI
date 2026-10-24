import re
import uuid
from typing import Any, Optional

from app.schemas.discovery import (
    GeneratedQuestion,
    GeneratedSearchQueries,
    NextQuestion,
    SearchSpecification,
)
from app.service.groq_service import ask_groq
from app.storage.sessions import sessions


ALLOWED_FIELDS = ("category", "price", "quantity","mode","specifications")

MAX_QUESTIONS = 6

def next_missing_field(
    session: dict[str, Any],
) -> Optional[str]:

    if not session.get("category"):
        return "category"

    if "price" not in session["answers"]:
        return "price"

    if "quantity" not in session["answers"]:
        return "quantity"

    return None


def generate_question(
    field: str,
    session: dict[str, Any],
) -> NextQuestion:

    if field not in ALLOWED_FIELDS:
        raise ValueError("Unsupported question field.")

    question_instructions = {
        "category": (
            "Ask which category the product belongs to."
        ),
        "price": (
            "Ask for the target price or budget. "
            "Ask only about price."
        ),
        "quantity": (
            "Ask how many units are required. "
            "Ask only about quantity."
        ),
        "mode":(
            "Ask the mode of the product. "
            "Ask only about mode."
        ),
        "specifications":(
            "Ask the specifications of the product. "
            "Ask only about specifications."
        ),

       
    }

    prompt = f"""
Generate exactly one short question for a product questionnaire.

Product: {session["product"]}
Category: {session.get("category") or "Not provided"}
Known answers: {session["answers"]}
Permitted field: {field}

Instruction:
{question_instructions[field]}

Rules:
- Return JSON with a single property named "question".
- Do not ask about location, brand, specifications,
  delivery, application, or preferences.
- Do not ask multiple questions.
- Do not generate questions for other fields.
"""

    result = ask_groq(prompt, GeneratedQuestion)

    if not result.question.strip():
        raise RuntimeError("Groq generated an empty question.")

    return NextQuestion(
        done=False,
        field=field,
        question=result.question.strip(),
        options=[],
        input_type="number" if field == "quantity" else "text",
        required=True,
    )


def parse_price(
    value: str,
) -> tuple[Optional[float], Optional[float]]:

    cleaned = value.lower().replace(",", "")
    numbers = re.findall(r"\d+(?:\.\d+)?", cleaned)

    if not numbers:
        raise ValueError(
            "Enter a valid price, such as 500 or 500-1000."
        )

    values = [float(number) for number in numbers[:2]]

    if len(values) == 1:
        return None, values[0]

    return min(values), max(values)



def start_session(
    product: str,
    category: Optional[str] = None,
) -> dict[str, Any]:

    product = product.strip()
    category = category.strip() if category else None

    if not product:
        raise ValueError("Product name cannot be empty.")

    session_id = str(uuid.uuid4())

    session = {
        "product": product,
        "category": category or None,
        "answers": {},
        "asked_fields": [],
        "complete": False,
        "specification": None,
    }

    sessions[session_id] = session

    field = next_missing_field(session)

    if field is None:
        return finish_questionnaire(session_id, session)

    try:
        question = generate_question(field, session)
    except Exception:
        sessions.pop(session_id, None)
        raise

    session["asked_fields"].append(field)

    return {
        "session_id": session_id,
        "product": product,
        "question": question.model_dump(),
    }


def submit_answer(
    session_id: str,
    field: str,
    answer: str,
) -> dict[str, Any]:

    session = sessions.get(session_id)

    if session is None:
        raise ValueError("Session not found.")

    if session["complete"]:
        raise ValueError("Questionnaire is already complete.")

    if field not in ALLOWED_FIELDS:
        raise ValueError("This question field is not allowed.")

    expected_field = (
        session["asked_fields"][-1]
        if session["asked_fields"]
        else None
    )

    if field != expected_field:
        raise ValueError(
            f"Expected an answer for field: {expected_field}"
        )

    answer = answer.strip()

    if not answer:
        raise ValueError("Answer cannot be empty.")

    # Validate and store the answer.
    if field == "category":
        session["category"] = answer

    elif field == "price":
        parse_price(answer)
        session["answers"]["price"] = answer

    elif field == "quantity":
        try:
            quantity = int(answer)
            if quantity <= 0:
                raise ValueError
        except ValueError:
            raise ValueError(
                "Quantity must be a positive whole number."
            )

        session["answers"]["quantity"] = quantity

    # The current question has been answered.
    session["asked_fields"].pop()

    next_field = next_missing_field(session)

    if next_field is None:
        return finish_questionnaire(session_id, session)

    try:
        question = generate_question(next_field, session)
    except Exception:
        # The answer remains saved. The client can restart the session
        # if Groq is unavailable; persistence/retry can be added later.
        raise

    session["asked_fields"].append(next_field)

    return {
        "session_id": session_id,
        "answers": {
            "category": session["category"],
            **session["answers"],
        },
        "question": question.model_dump(),
        "complete": False,
    }


def finish_questionnaire(
    session_id: str,
    session: dict[str, Any],
) -> dict[str, Any]:

    price_text = session["answers"].get("price", "")
    budget_min, budget_max = parse_price(price_text)

    quantity = session["answers"].get("quantity")
    category = session.get("category") or "Unspecified"

    prompt = f"""
Generate product sourcing search queries.

Product: {session["product"]}
Category: {category}
User's price or budget: {price_text}
Quantity: {quantity}

Rules:
- Produce one main search query.
- Produce up to three alternative search queries.
- Do not invent brands, specifications, locations,
  suppliers, stock availability, or prices.
- Do not ask questions.
- Return JSON with search_query and alternate_queries only.
"""

    generated = ask_groq(prompt, GeneratedSearchQueries)

    specification = SearchSpecification(
        product=session["product"],
        category=category,
        budget_min=budget_min,
        budget_max=budget_max,
        currency="INR",
        quantity=quantity,
        search_query=generated.search_query,
        alternate_queries=generated.alternate_queries[:3],
    )

    session["complete"] = True
    session["specification"] = specification.model_dump()

    return {
        "session_id": session_id,
        "complete": True,
        "answers": {
            "category": category,
            "price": price_text,
            "quantity": quantity,
        },
        "search_specification": specification.model_dump(),
    }


def get_search_specification(
    session_id: str,
) -> dict[str, Any]:

    session = sessions.get(session_id)

    if session is None:
        raise ValueError("Session not found.")

    if not session["complete"]:
        raise ValueError("Complete the questionnaire first.")

    return {
        "session_id": session_id,
        "search_specification": session["specification"],
    }
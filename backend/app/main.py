import json
import os
import re
import uuid
from typing import Any, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from pydantic import BaseModel, Field, ValidationError

load_dotenv()

# ============================================================
# CONFIGURATION
# ============================================================

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY is missing from your .env file")

client = Groq(api_key=GROQ_API_KEY)

app = FastAPI(
    title="AI Product Discovery API",
    description="Groq-powered product discovery questionnaire",
    version="1.3.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "https://njh45jg4-5174.inc1.devtunnels.ms"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Demo-only in-memory storage. Sessions disappear when the server restarts.
sessions: dict[str, dict[str, Any]] = {}

# The questionnaire is restricted to these three fields.
ALLOWED_QUESTION_FIELDS = ("category", "price", "quantity")


# ============================================================
# PYDANTIC SCHEMAS
# ============================================================

class StartRequest(BaseModel):
    product: str = Field(min_length=2, max_length=200)
    category: Optional[str] = Field(default=None, max_length=200)


class AnswerRequest(BaseModel):
    session_id: str
    field: str
    answer: str = Field(min_length=1, max_length=1000)


class NextQuestion(BaseModel):
    done: bool
    field: str
    question: str
    options: list[str] = Field(default_factory=list)
    input_type: str
    required: bool


class SearchSpecification(BaseModel):
    product: str
    category: str
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    currency: str = "INR"
    quantity: Optional[int] = None
    search_query: str
    alternate_queries: list[str] = Field(default_factory=list)


class GeneratedQuestion(BaseModel):
    question: str


class GeneratedSearchQueries(BaseModel):
    search_query: str
    alternate_queries: list[str] = Field(default_factory=list)


# ============================================================
# GROQ HELPER
# ============================================================

def ask_groq(prompt: str, response_model: type[BaseModel]) -> BaseModel:
    """Request structured JSON from Groq and validate the response."""

    schema = response_model.model_json_schema()

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an AI product discovery assistant. "
                        "Be concise and generate only the requested output. "
                        "Never introduce extra questionnaire fields. "
                        "Return valid JSON only."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"{prompt}\n\n"
                        "Return one JSON object matching this schema:\n"
                        f"{json.dumps(schema, ensure_ascii=False)}"
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

    except ValidationError as exc:
        raise RuntimeError(
            f"Groq returned invalid JSON fields: {exc}"
        ) from exc
    except Exception as exc:
        raise RuntimeError(f"Groq API request failed: {exc}") from exc


# ============================================================
# QUESTION GENERATION
# Groq generates the wording.
# Python controls which fields can be asked.
# ============================================================

def generate_question(
    field: str,
    session: dict[str, Any],
) -> NextQuestion:

    if field not in ALLOWED_QUESTION_FIELDS:
        raise ValueError(f"Unsupported question field: {field}")

    instructions = {
        "category": (
            "Ask which category the product belongs to. "
            "Example: Which category does this product belong to?"
        ),
        "price": (
            "Ask for the target price or budget for this product. "
            "Do not ask any other question."
        ),
        "quantity": (
            "Ask how many units of this product are required. "
            "Do not ask any other question."
        ),
    }

    prompt = f"""
Generate exactly ONE short question for a product discovery questionnaire.

Product: {session["product"]}
Known category: {session.get("category") or "Not provided"}
Previously supplied answers:
{json.dumps(session["answers"], ensure_ascii=False)}

The only permitted question field is: {field}

Question instruction:
{instructions[field]}

Rules:
- Return only a JSON object with one property named "question".
- Generate exactly one question.
- Do not ask about location, brand, technical specifications,
  delivery, preferences, application, or any other information.
- Do not combine multiple questions.
- Do not ask for information that belongs to another field.
"""

    generated = ask_groq(prompt, GeneratedQuestion)

    question_text = generated.question.strip()

    if not question_text:
        raise RuntimeError("Groq generated an empty question.")

    # The field and input type are determined by Python, not the LLM.
    return NextQuestion(
        done=False,
        field=field,
        question=question_text,
        options=[],
        input_type="number" if field == "quantity" else "text",
        required=True,
    )


# ============================================================
# DETERMINE THE NEXT REQUIRED FIELD
# ============================================================

def next_missing_field(session: dict[str, Any]) -> Optional[str]:

    if not session.get("category"):
        return "category"

    if "price" not in session["answers"]:
        return "price"

    if "quantity" not in session["answers"]:
        return "quantity"

    return None


# ============================================================
# PRICE PARSING
# ============================================================

def parse_price(
    value: str,
) -> tuple[Optional[float], Optional[float]]:
    """
    Examples:
        "500"          -> minimum=None, maximum=500
        "500-1000"      -> minimum=500, maximum=1000
        "500 to 1000"   -> minimum=500, maximum=1000
        "₹500 - ₹1000"  -> minimum=500, maximum=1000

    A single number is interpreted as a maximum budget.
    """

    cleaned = value.lower().replace(",", "")
    numbers = re.findall(r"\d+(?:\.\d+)?", cleaned)

    if not numbers:
        return None, None

    parsed = [float(number) for number in numbers[:2]]

    if len(parsed) == 1:
        return None, parsed[0]

    return min(parsed), max(parsed)


# ============================================================
# START SESSION
# POST /sessions/start
# ============================================================

@app.post("/sessions/start")
def start_session(request: StartRequest):

    product = request.product.strip()
    category = request.category.strip() if request.category else None

    if not product:
        raise HTTPException(
            status_code=422,
            detail="Product name cannot be empty.",
        )

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
    except Exception as exc:
        sessions.pop(session_id, None)
        raise HTTPException(
            status_code=502,
            detail=f"Could not generate the first question: {exc}",
        ) from exc

    session["asked_fields"].append(field)

    return {
        "session_id": session_id,
        "product": product,
        "question": question.model_dump(),
    }


# ============================================================
# SUBMIT ANSWER
# POST /sessions/answer
# ============================================================

@app.post("/sessions/answer")
def submit_answer(request: AnswerRequest):

    session = sessions.get(request.session_id)

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Session not found.",
        )

    if session["complete"]:
        raise HTTPException(
            status_code=400,
            detail="Questionnaire is already complete.",
        )

    expected_field = (
        session["asked_fields"][-1]
        if session["asked_fields"]
        else None
    )

    if request.field != expected_field:
        raise HTTPException(
            status_code=400,
            detail=f"Expected an answer for field: {expected_field}",
        )

    if request.field not in ALLOWED_QUESTION_FIELDS:
        raise HTTPException(
            status_code=400,
            detail="This question field is not allowed.",
        )

    answer = request.answer.strip()

    if not answer:
        raise HTTPException(
            status_code=422,
            detail="Answer cannot be empty.",
        )

    # Validate quantity before saving the answer.
    if request.field == "quantity":
        try:
            quantity = int(answer)

            if quantity <= 0:
                raise ValueError

        except ValueError:
            raise HTTPException(
                status_code=422,
                detail="Quantity must be a positive whole number.",
            )

        session["answers"]["quantity"] = quantity

    elif request.field == "category":
        session["category"] = answer

    elif request.field == "price":
        session["answers"]["price"] = answer

    # The current question has now been answered.
    session["asked_fields"].pop()

    field = next_missing_field(session)

    # All three required fields have been collected.
    if field is None:
        return finish_questionnaire(request.session_id, session)

    # Generate the next question.
    try:
        question = generate_question(field, session)
    except Exception as exc:
        # Keep the accepted answer. Retry generating this same next question
        # on a subsequent request without losing the questionnaire state.
        session["asked_fields"].append(field)

        raise HTTPException(
            status_code=502,
            detail=f"Could not generate the next question: {exc}",
        ) from exc

    session["asked_fields"].append(field)

    return {
        "session_id": request.session_id,
        "answers": {
            "category": session["category"],
            **session["answers"],
        },
        "question": question.model_dump(),
        "complete": False,
    }


# ============================================================
# BUILD FINAL SEARCH SPECIFICATION
# ============================================================

def finish_questionnaire(
    session_id: str,
    session: dict[str, Any],
):

    price_text = session["answers"].get("price", "")
    budget_min, budget_max = parse_price(price_text)

    quantity = session["answers"].get("quantity")
    category = session.get("category") or "Unspecified"

    prompt = f"""
Generate search queries for sourcing this product.

Product: {session["product"]}
Category: {category}
Price or budget supplied by user: {price_text}
Quantity: {quantity}

Rules:
- Generate one main search query.
- Generate up to three alternative search queries.
- Queries should help find the product and relevant suppliers.
- Do not invent product specifications, brands, supplier names,
  locations, availability, or prices.
- Do not ask any questions.
- Return JSON with these fields only:
  search_query, alternate_queries.
"""

    try:
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

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Could not generate search specification: {exc}",
        ) from exc


# ============================================================
# GET FINAL SEARCH SPECIFICATION
# GET /sessions/{session_id}/search-specification
# ============================================================

@app.get("/sessions/{session_id}/search-specification")
def get_search_specification(session_id: str):

    session = sessions.get(session_id)

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Session not found.",
        )

    if not session["complete"]:
        raise HTTPException(
            status_code=400,
            detail="Complete the questionnaire first.",
        )

    return {
        "session_id": session_id,
        "search_specification": session["specification"],
    }


# ============================================================
# HEALTH CHECK
# GET /
# ============================================================

@app.get("/")
def root():

    return {
        "status": "running",
        "service": "AI Product Discovery API",
        "provider": "Groq",
        "model": GROQ_MODEL,
        "allowed_question_fields": list(ALLOWED_QUESTION_FIELDS),
    }
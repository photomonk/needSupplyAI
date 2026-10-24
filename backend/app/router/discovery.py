from fastapi import APIRouter, HTTPException

from app.schemas.discovery import (
    AnswerRequest,
    StartRequest,
)
from app.service import discovery_service

router = APIRouter(
    prefix="/sessions",
    tags=["Product Discovery"],
)


def handle_service_error(exc: Exception) -> HTTPException:
    message = str(exc)

    if message == "Session not found.":
        return HTTPException(status_code=404, detail=message)

    if (
        "Expected an answer" in message
        or "already complete" in message
        or "not allowed" in message
    ):
        return HTTPException(status_code=400, detail=message)

    if (
        "cannot be empty" in message
        or "positive whole number" in message
        or "valid price" in message
        or "Quantity" in message
    ):
        return HTTPException(status_code=422, detail=message)

    return HTTPException(
        status_code=502,
        detail=f"Product discovery service error: {message}",
    )


@router.post("/start")
def start(request: StartRequest):
    try:
        return discovery_service.start_session(
            product=request.product,
            category=request.category,
        )
    except Exception as exc:
        raise handle_service_error(exc) from exc


@router.post("/answer")
def answer(request: AnswerRequest):
    try:
        return discovery_service.submit_answer(
            session_id=request.session_id,
            field=request.field,
            answer=request.answer,
        )
    except Exception as exc:
        raise handle_service_error(exc) from exc


@router.get("/{session_id}/search-specification")
def search_specification(session_id: str):
    try:
        return discovery_service.get_search_specification(
            session_id
        )
    except Exception as exc:
        raise handle_service_error(exc) from exc




from app.schemas.discovery import LocationInput
from app.storage.sessions import sessions


@router.post("/{session_id}/location")
def set_location(
    session_id: str,
    location: LocationInput,
):
    session = sessions.get(session_id)

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

    session["location"] = location.model_dump()

    return {
        "session_id": session_id,
        "location": session["location"],
        "message": "Location saved successfully.",
    }    
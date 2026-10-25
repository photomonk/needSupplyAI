from app.schemas.discovery import (
    AnswerRequest,
    StartRequest,
    LocationInput,
    SupplierSearchRequest,  # <-- Import the new schema
)
from app.service import discovery_service

# ... (your existing router setup, start, answer, search-specification, and location routes) ...

@router.post("/supplier-search")
def supplier_search(request: SupplierSearchRequest):
    """
    Accepts category, price, quantity, mode, and specifications
    to search for matching suppliers using the discovery service.
    """
    try:
        query_payload = request.model_dump()
        
        # Call the service layer handling scrap_agent logic
        results = discovery_service.search_suppliers(query_payload)
        
        return {
            "status": "success",
            "data": results,
        }
    except Exception as exc:
        raise handle_service_error(exc) from exc
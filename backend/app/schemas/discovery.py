from typing import Optional

from pydantic import BaseModel, Field


class StartRequest(BaseModel):
    product: str = Field(min_length=2, max_length=200)
    category: Optional[str] = Field(
        default=None,
        max_length=200,
    )


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
    alternate_queries: list[str] = Field(
        default_factory=list
    )


class GeneratedQuestion(BaseModel):
    question: str


class GeneratedSearchQueries(BaseModel):
    search_query: str
    alternate_queries: list[str] = Field(
        default_factory=list
    )

from typing import Literal, Optional
from pydantic import BaseModel, Field, model_validator


class LocationInput(BaseModel):
    mode: Literal["live", "typed"]

    # For typed location
    address: Optional[str] = Field(
        default=None,
        max_length=300,
    )

    # For live location
    latitude: Optional[float] = Field(
        default=None,
        ge=-90,
        le=90,
    )
    longitude: Optional[float] = Field(
        default=None,
        ge=-180,
        le=180,
    )

    @model_validator(mode="after")
    def validate_location(self):
        if self.mode == "typed":
            if not self.address or not self.address.strip():
                raise ValueError(
                    "Enter a city, area, PIN code, or address."
                )

        if self.mode == "live":
            if self.latitude is None or self.longitude is None:
                raise ValueError(
                    "Latitude and longitude are required "
                    "for live location."
                )

        return self


class LocationResponse(BaseModel):
    mode: Literal["live", "typed"]
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class SupplierSearchRequest(BaseModel):
    category: str = Field(..., min_length=1, description="Product category")
    price: str = Field(..., description="Target price or budget range")
    quantity: int = Field(..., gt=0, description="Required quantity")
    mode: str = Field(..., description="Search mode or procurement channel")
    specifications: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Detailed product specs")



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


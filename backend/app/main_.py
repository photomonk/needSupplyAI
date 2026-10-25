from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import GROQ_MODEL
from app.router.discovery import router as discovery_router
from app.router.agent import router as agent_router

app = FastAPI(
    title="AI Product Discovery API",
    description=(
        "Groq-powered product discovery with a "
        "category, price, and quantity questionnaire."
    ),
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[ 
        "https://f3q7wjz2-5174.inc1.devtunnels.ms",
        "http://localhost:5174",
        "https://njh45jg4-5174.inc1.devtunnels.ms",
        
        


    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(discovery_router)
app.include_router(agent_router)


@app.get("/")
def root():
    return {
        "status": "running",
        "service": "AI Product Discovery API",
        "provider": "Groq",
        "model": GROQ_MODEL,
        "allowed_question_fields": [
            "category",
            "price",
            "quantity",
        ],
    }


@app.get("/health")
def health():
    return {"status": "healthy"}
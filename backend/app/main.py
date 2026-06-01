from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.endpoints import (
    health,
    dashboard,
    claims,
    policies,
    notifications,
    predict,
    upload,
    settings as settings_endpoint
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise API Gateway connecting AXA PRISM Next.js to Supabase",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Set up CORS middleware to allow Next.js frontend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include standard endpoints
app.include_router(health.router, prefix="/health", tags=["Health"])

# Include versioned API routing
app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["Dashboard"])
app.include_router(claims.router, prefix=f"{settings.API_V1_STR}/claims", tags=["Claims"])
app.include_router(policies.router, prefix=f"{settings.API_V1_STR}/policies", tags=["Policies"])
app.include_router(notifications.router, prefix=f"{settings.API_V1_STR}/notifications", tags=["Notifications"])
app.include_router(predict.router, prefix=f"{settings.API_V1_STR}/predict", tags=["Prediction"])
app.include_router(upload.router, prefix=f"{settings.API_V1_STR}/upload", tags=["Upload"])
app.include_router(settings_endpoint.router, prefix=f"{settings.API_V1_STR}/settings", tags=["Settings"])

@app.get("/")
def read_root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)

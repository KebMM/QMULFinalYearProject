#For calling the routes and CORS middleware

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from .routes.export import router as export_router
from .routes.auth import router as auth_router
from .routes.metrics import router as metrics_router
from .routes.projects import router as projects_router
from .routes.admin_routes import router as admin_router
from .routes.reports import router as reports_router
from .routes.suites import router as suites_router

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SessionMiddleware, secret_key=os.getenv("SECRET_KEY"))

#Routes
app.include_router(export_router, prefix="/export-report", tags=["Export Report"])
app.include_router(auth_router, tags=["Authentication"])
app.include_router(reports_router, tags=["Test Reports"])
app.include_router(projects_router, tags=["Favourite Projects"])
app.include_router(metrics_router, tags=["Metrics"])
app.include_router(admin_router, tags=["Admin Endpoints"])
app.include_router(suites_router, tags=["Suite Endpoints"])

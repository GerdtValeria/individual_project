from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.api.categories import router as router_categories
from app.api.categories import router as router_comments
from app.api.images import router as router_images
from app.api.rents import router as router_rents
from app.api.roles import router as router_roles
from app.api.auth import router as router_users
from app.api.bookings import router as router_bookings
from app.api.favorites import router as router_favorites
from app.api.help import router as router_help
from app.api.web import router as router_web
from app.database.database import create_tables

app = FastAPI()


app.mount("/static", StaticFiles(directory="app/static"), "static")

app.include_router(router_bookings)
app.include_router(router_categories)
app.include_router(router_comments)
app.include_router(router_images)
app.include_router(router_rents)
app.include_router(router_roles)
app.include_router(router_users)
app.include_router(router_favorites)
app.include_router(router_help)
app.include_router(router_web)

@app.on_event("startup")
async def startup():
    await create_tables()

@app.get("/")
async def root():
    return {"message": "Угол Комфорта API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
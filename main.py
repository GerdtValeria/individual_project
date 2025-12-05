from fastapi import FastAPI
from app.api.bookings import router as router_bookings
from app.api.categories import router as router_categories
from app.api.comments import router as router_comments
from app.api.images import router as router_images
from app.api.rents import router as router_rents
from app.api.roles import router as router_roles
from app.api.auth import router as router_users
from app.api.favorites import router as router_favorites

app = FastAPI()


@app.get("/")
def home_page():
    return {"message": "Привет, Хабр!"}


app.include_router(router_bookings)
app.include_router(router_categories)
app.include_router(router_comments)
app.include_router(router_images)
app.include_router(router_rents)
app.include_router(router_roles)
app.include_router(router_users)
app.include_router(router_favorites)
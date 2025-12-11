from fastapi import APIRouter, Request

from fastapi.templating import Jinja2Templates


router = APIRouter(prefix="/web", tags=["Фронтенд"])
templates = Jinja2Templates(directory="app/templates")


@router.get("/auth")
async def get_registration_html(request: Request):
    return templates.TemplateResponse(name="signup.html", context={"request": request})


@router.get("/")
async def get_index_html(request: Request):
    return templates.TemplateResponse(name="index.html", context={"request": request})


@router.get("/")
async def get_booking_html(request: Request):
    return templates.TemplateResponse(name="booking.html", context={"request": request})


@router.get("/")
async def get_detail_html(request: Request):
    return templates.TemplateResponse(name="detail.html", context={"request": request})


@router.get("/")
async def get_favorites_html(request: Request):
    return templates.TemplateResponse(name="favorites.html", context={"request": request})


@router.get("/")
async def get_list_html(request: Request):
    return templates.TemplateResponse(name="list.html", context={"request": request})


@router.get("/")
async def get_profile_html(request: Request):
    return templates.TemplateResponse(name="profile.html", context={"request": request})


@router.get("/")
async def get_rent_html(request: Request):
    return templates.TemplateResponse(name="rent.html", context={"request": request})


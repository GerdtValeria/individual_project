from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from app.services.rents import RentService
from app.api.dependencies import DBDep, get_current_user_id

from fastapi.templating import Jinja2Templates


router = APIRouter(prefix="/web", tags=["Фронтенд"])
templates = Jinja2Templates(directory="app/templates")


@router.get("/auth")
async def get_registration_html(request: Request):
    return templates.TemplateResponse(name="signup.html", context={"request": request})


@router.get("/")
async def get_index_html(request: Request):
    return templates.TemplateResponse(name="index.html", context={"request": request})


@router.get("/booking")
async def get_booking_html(request: Request):
    return templates.TemplateResponse(name="booking.html", context={"request": request})


@router.get("/rents/{id}")
async def get_rent_html(id: int, request: Request, db: DBDep):
    # Получаем данные объявления из API
   
    rent = await RentService(db).get_rent(id=id)
    
    return templates.TemplateResponse(
        name="detail.html",
        context={
            "request": request,
        }
    )


@router.get("/list")
async def get_list_html(request: Request):
    try:
        user_id = await get_current_user_id(request)
    except HTTPException:
        return RedirectResponse(url="/web/auth", status_code=307)

    return templates.TemplateResponse(
        name="list.html",
        context={"request": request, "user_id": user_id},
    )

@router.get("/favorites")
async def get_favorites_html(request: Request):
    try:
        user_id = await get_current_user_id(request)
    except HTTPException:
        return RedirectResponse(url="/web/auth", status_code=307)

    return templates.TemplateResponse(
        name="favorites.html",
        context={"request": request, "user_id": user_id},
    )


@router.get("/profile")
async def get_profile_html(request: Request):
    return templates.TemplateResponse(name="profile.html", context={"request": request})


@router.get("/rents")
async def get_rent_html(request: Request):
    return templates.TemplateResponse(name="rent.html", context={"request": request})

@router.get("/admin/users")
async def get_rent_html(request: Request):
    return templates.TemplateResponse(name="admin-users.html", context={"request": request})

@router.get("/admin/help")
async def get_rent_html(request: Request):
    return templates.TemplateResponse(name="admin-questions.html", context={"request": request})
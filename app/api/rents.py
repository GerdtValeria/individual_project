from typing import Optional
from app.api.dependencies import DBDep, PaginationDep, get_current_user_id
from fastapi import APIRouter, Depends, HTTPException, Query
from app.models.users import UserModel
from app.schemas.rents import SRentAdd, SRentGet, SRentGetWithRels
from app.services.rents import RentService
from exceptions.rents import InvalidRentFilterException

router = APIRouter(prefix="/rents",tags=["Rent"])


@router.get("/", response_model=list[SRentGetWithRels])
async def get_rents(
    db: DBDep,
    q: Optional[str] = Query(None, description="Поисковый запрос"),
    title: Optional[str] = Query(None, description="Название"),
    address: Optional[str] = Query(None, description="Адрес"),  
    price: Optional[int] = Query(None, description="Цена"),
    description: Optional[str] = Query(None, description="Описание"), 
    id_category: Optional[int] = Query(None, description="Категория"),
    id_user: Optional[int] = Query(None, description="ID пользователя"),
    active: Optional[bool] = Query(True, description="Только активные"),
    page: int = Query(1, ge=1, description="Номер страницы"),
    size: int = Query(20, ge=1, le=100, description="Количество на странице")
) -> list[SRentGetWithRels]:
    """
    Получить все объявления с возможностью фильтрации.
    """
    service = RentService(db)
    pagination = {"page": page, "size": size}
    
    rents = await service.get_filtered_rents(
        pagination=pagination,
        search_query=q,
        title=title,
        address=address, 
        price=price,
        id_category=id_category,
        id_user=id_user,
        description=description,
        active=active
    )

    return rents

@router.post("/", response_model=SRentGet)
async def add_rent(rent_data: SRentAdd, db: DBDep):
    return await RentService(db).add_rent(rent_data)

@router.get("/{id}", response_model=SRentGet)
async def get_rent(db: DBDep,id:int,):
    rent = await RentService(db).get_rent(id=id)   
    return rent


@router.put("/{rent_id}", response_model=None)
async def edit_rent(
    rent_id: int,
    rent_data: SRentAdd,
    current_user_id: int = Depends(get_current_user_id),
    service: RentService = Depends(),
):
    await service.edit_rent(rent_id, rent_data)
    return {"message": "Объявление обновлено"}


@router.delete("/{id}")
async def delete_rent(id:int, db: DBDep,) -> dict[str, str]:
     await RentService(db).delete_rent(id=id)   
     return {"message": "Rent deleted successfully"}
from typing import List, Optional
from app.api.dependencies import DBDep, PaginationDep
from fastapi import APIRouter, HTTPException, Query
from app.schemas.rents import SRentAdd, SRentGet
from app.services.rents import RentService
from exceptions.rents import InvalidRentFilterException

router = APIRouter(prefix="/rents",tags=["Rent"])


@router.get("/", response_model=List[SRentGet])
async def get_rents(
    db: DBDep,
    pagination: PaginationDep,
    id_category: Optional[int] = Query(None, description="ID категории"),
    id_user: Optional[int] = Query(None, description="ID пользователя"),
    price_from: Optional[int] = Query(
        0, description="Начало диапазона стоимости аренды"
    ),
    price_to: Optional[int] = Query(
        None, description="Конец диапазона стоимости аренды"
    ),
    title: Optional[str] = Query(None, description="Название объявления"),
    active: Optional[bool] = Query(None, description="Активно ли объявление"),
    address: Optional[str] = Query(None, description="Адрес аренды"),
) -> List[SRentGet] | None:
    try:
        rents = await RentService(db).get_filtered_rents(
            id_category=id_category,
            id_user=id_user,
            price_from=price_from,
            price_to=price_to,
            title=title,
            active=active,
            address=address,
            pagination=pagination,
        )
    except InvalidRentFilterException as e:
        raise HTTPException(400, e.detail)
    
    return rents

@router.get("/{id}", response_model=SRentGet)
async def get_rent(db: DBDep,id:int,):
    rent = await RentService(db).get_all_rents(id=id)   
    return rent

@router.get("/{category_id}", response_model=SRentGet)
async def get_category_rent(db: DBDep,category_id:int,):
    rent = await RentService(db).get_category_rents(category_id=category_id)   
    return rent

@router.post("/",response_model=SRentGet)
async def add_rent(rent_data: SRentAdd, db: DBDep,) -> dict[str, str]:
    rent = await RentService(db).add_rent(rent_data)
    return rent

@router.put("/{id}")
async def edit_rent(id:int, rent_data: SRentAdd):
    await RentService().edit_rent(id,rent_data)
    return {"message": "Rent updated successfully"}


@router.delete("/{id}")
async def delete_rent(id:int, db: DBDep,) -> dict[str, str]:
     await RentService(db).delete_rent(id=id)   
     return {"message": "Rent deleted successfully"}
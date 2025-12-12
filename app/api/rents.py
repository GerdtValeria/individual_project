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
    q: Optional[str] = Query(None, description="Поисковый запрос"),
    title: Optional[str] = Query(None, description="Название"),
    adress: Optional[str] = Query(None, description="Район"),
    price: Optional[int] = Query(None, description="Цена"),
    guests: Optional[int] = Query(None, description="Количество гостей"),
    description: Optional[int] = Query(None, description="Описание"),
    id_category: Optional[int] = Query(None, description="Категория"),
    id_user: Optional[int] = Query(None, description="ID пользователя"),
    page: int = Query(1, ge=1, description="Номер страницы"),
    size: int = Query(20, ge=1, le=100, description="Количество на странице")
) -> List[SRentGet]:
    """
    Получить все объявления с возможностью фильтрации.
    Можно использовать как альтернативу /search
    """
    service = RentService(db)
    pagination = {"page": page, "size": size}
    
    rents = await service.get_filtered_rents(
        pagination=pagination,
        search_query=q,
        title=title,
        adress=adress,
        price=price,
        guests=guests,
        id_category=id_category,
        id_user=id_user,
        description=description,
        active=True 
    )
    
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
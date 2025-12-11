from typing import List, Optional
from app.api.dependencies import DBDep
from fastapi import APIRouter, Query
from app.schemas.rents import SRentAdd, SRentGet
from app.services.rents import RentService

router = APIRouter(prefix="/rents",tags=["Rent"])


@router.get("/", response_model=List[SRentGet])
async def get_rents(
    db: DBDep,
    search: Optional[str] = Query(None, description="Поисковый запрос по названию, описанию, городу, району или адресу"),
    city: Optional[str] = Query(None, description="Фильтр по городу"),
    adress: Optional[str] = Query(None, description="Фильтр по району"),
    category_id: Optional[int] = Query(None, description="ID категории"),
    limit: Optional[int] = Query(20, description="Лимит результатов"),
    offset: Optional[int] = Query(0, description="Смещение для пагинации")
) -> List[SRentGet]:

    # Если есть поисковый запрос, используем метод filtered
    if search:
        rents = await RentService(db).filtered(
            search_query=search,
            city=city,
            adress=adress,
            category_id=category_id,
            limit=limit,
            offset=offset
        )
    else:

        rents = await RentService(db).get_all_rents()
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
from app.api.dependencies import DBDep
from fastapi import APIRouter
from app.schemas.rents import SRentAdd, SRentGet
from app.services.rents import RentService

router = APIRouter(prefix="/rents",tags=["Rent"])

@router.get("/", response_model=list[SRentGet])
async def get_rents(db: DBDep,) -> list[SRentGet]:
    rents = await RentService(db).get_all_rents()   
    return rents

@router.get("/{id}", response_model=SRentGet)
async def get_rent(db: DBDep,id:int,):
    rent = await RentService(db).get_all_rents(id=id)   
    return rent

@router.post("/",response_model=SRentGet)
async def add_rent(rent_data: SRentAdd, db: DBDep,) -> SRentGet:
    await RentService(db).add_rent(rent_data)

@router.put("/{id}")
async def edit_rent(id:int, rent_data: SRentAdd):
    await RentService().edit_rent(id,rent_data)
    return {"message": "Rent updated successfully"}


@router.delete("/{id}")
async def delete_rent(id:int, db: DBDep,) -> SRentGet:
     await RentService(db).delete_rent(id=id)   
     return {"message": "Rent deleted successfully"}
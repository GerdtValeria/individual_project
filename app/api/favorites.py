from app.api.dependencies import DBDep
from fastapi import APIRouter
from app.schemas.comments import SCommentAdd
from app.schemas.favorites import SFavoriteRentAdd, SFavoriteRentGet
from app.services.favorites import FavoritesService

router = APIRouter(prefix="/comments",tags=["Comment"])

@router.get("/", response_model=list[SFavoriteRentGet])
async def get_rents( db: DBDep,) -> list[SFavoriteRentGet]:
 favorite_rents = await FavoritesService(db).get_all_favorite_rents()   
 return favorite_rents

@router.post("/")
async def add_rent(rent_data: SFavoriteRentAdd):
    await FavoritesService().add_favorite_rent(rent_data)


@router.delete("/{id}")
async def delete_rent(id:int):
     await FavoritesService().delete_favorite_rent(id=id)   

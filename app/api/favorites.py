from app.api.dependencies import DBDep, get_current_user_id
from fastapi import APIRouter, Depends
from app.schemas.comments import SCommentAdd
from app.schemas.favorites import SFavoriteRentAdd, SFavoriteRentGet
from app.services.favorites import FavoritesService

router = APIRouter(prefix="/comments",tags=["Comment"])

@router.get("/", response_model=list[SFavoriteRentGet])
async def get_rents(db: DBDep, user = Depends(get_current_user_id)):
    favorite_rents = await FavoritesService(db).get_all_favorite_rents(user.id)
    return favorite_rents

@router.post("/", response_model=SFavoriteRentGet)
async def add_rent(rent_data: SFavoriteRentAdd, db: DBDep,) -> dict[str, str]:
    await FavoritesService(db).add_favorite_rent(rent_data)
    return {"message": "Favorite rent updated successfully"}

@router.delete("/{id}")
async def delete_rent(id:int, db: DBDep,) -> dict[str, str]:
     await FavoritesService(db).delete_favorite_rent(id=id)  
     return {"message": "Fvorite rent deleted successfully"} 

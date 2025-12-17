from app.api.dependencies import DBDep, get_current_user_id
from fastapi import APIRouter, Depends
from app.schemas.comments import SCommentAdd
from app.schemas.favorites import SFavoriteRentAdd, SFavoriteRentGet
from app.services.favorites import FavoritesService

router = APIRouter(prefix="/comments",tags=["Comment"])

@router.get("/", response_model=list[SFavoriteRentGet])
async def get_rents(db: DBDep, user_id: int = Depends(get_current_user_id),):
    favorite_rents = await FavoritesService(db).get_all_favorite_rents(user_id)
    return favorite_rents

@router.post("/", response_model=SFavoriteRentGet)
async def add_rent(rent_data: SFavoriteRentAdd, db: DBDep,) -> dict[str, str]:
    await FavoritesService(db).add_favorite_rent(rent_data)
    return {"message": "Favorite rent updated successfully"}

@router.delete("/{rent_id}")
async def delete_rent(
    rent_id: int,
    db: DBDep,
    user_id: int = Depends(get_current_user_id),
) -> dict[str, str]:
    await FavoritesService(db).delete_rent(user_id=user_id, rent_id=rent_id)
    return {"message": "Favorite rent deleted successfully"}

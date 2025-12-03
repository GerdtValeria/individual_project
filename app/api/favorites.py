from fastapi import APIRouter
from app.schemas.comments import SCommentAdd
from app.schemas.favorites import SFavoriteRentAdd
from app.services.comments import CommentService
from app.services.favorites import FavoritesService

router = APIRouter(prefix="/comments",tags=["Comment"])

@router.get("/")
async def get_rents():
 rents = await CommentService().get_all_rents()   
 return rents

@router.post("/")
async def add_rent(rent_data: SFavoriteRentAdd):
    await CommentService().add_rent(rent_data)


@router.delete("/{id}")
async def delete_rent(id:int):
     await FavoritesService().delete_rent(id=id)   

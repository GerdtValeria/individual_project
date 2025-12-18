from sqlalchemy import and_, select, desc
from typing import List, Optional
from app.schemas.favorites import SFavoriteRentAdd, SFavoriteRentGet
from exceptions.bookings import RealtyNotAvailableException
from app.models.favorites import FavoritesModel
from app.repositories.base import BaseRepository
from app.repositories.utils import rooms_ids_free
from app.schemas.bookings import SBookingAdd

class FavoritesRepository(BaseRepository):
    model = FavoritesModel
    schema = SFavoriteRentGet

    async def get_all_favorite_rents(self, user_id: int):
        return await self.get_filtered(id_user=user_id)

    async def add_favorite_rent(self, data: SFavoriteRentAdd) -> SFavoriteRentGet:
        return await super().add(data)

    async def delete_favorite_rent(self, user_id: int, rent_id: int) -> None:
        await super().delete(
            and_(FavoritesModel.id_user == user_id, FavoritesModel.id_rent == rent_id)
        )

    async def is_favorite(self, user_id: int, rent_id: int) -> bool:
        favorite = await self.get_one_or_none(
            id_user=user_id, id_rent=rent_id
        )
        return favorite is not None
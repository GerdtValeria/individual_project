from sqlalchemy import select, desc
from typing import List, Optional
from app.schemas.favorites import SRentGet
from exceptions.bookings import RealtyNotAvailableException
from app.models.favorites import FavoritesModel
from app.repositories.base import BaseRepository
from app.repositories.utils import rooms_ids_free
from app.schemas.bookings import SBookingAdd

class FavoritesRepository(BaseRepository):
    model = FavoritesModel
    schema = SRentGet

    async def get_all(self) -> List[FavoritesModel]:
        return await super().get_all()
    
    async def add_booking(self, booking_data: SBookingAdd, hotel_id: int):
        rooms_ids_to_get = rooms_ids_free(
            date_from=booking_data.date_from,
            date_to=booking_data.date_to,
            hotel_id=hotel_id,
        )
        rooms_ids_to_booking: list[int] = (
            (await self.session.execute(rooms_ids_to_get)).scalars().all()
        )

        if booking_data.room_id in rooms_ids_to_booking:
            return await self.add(booking_data)
        else:
            raise RealtyNotAvailableException()

    async def get_by_user_id(self, user_id: int) -> List[FavoritesModel]:
        result = await self.session.execute(
            select(FavoritesModel).where(FavoritesModel.id_user == user_id)
        )
        return result.scalars().all()

    async def get_by_rent_id(self, rent_id: int) -> List[FavoritesModel]:
        result = await self.session.execute(
            select(FavoritesModel).where(FavoritesModel.id_rent == rent_id)
        )
        return result.scalars().all()

    async def get_recent_comments(self, limit: int = 10) -> List[FavoritesModel]:
        result = await self.session.execute(
            select(FavoritesModel).order_by(desc(FavoritesModel.id)).limit(limit)
        )
        return result.scalars().all()
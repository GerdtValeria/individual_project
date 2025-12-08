import logging
from sqlite3 import IntegrityError
from asyncpg import UniqueViolationError
from pydantic import BaseModel
from sqlalchemy import insert, select, and_
from typing import List, Optional
from datetime import date
from app.schemas.bookings import SBookingAdd, SBookingGet
from exceptions.base import ObjectAlreadyExistsException
from app.models.bookings import BookingsModel
from app.repositories.base import BaseRepository

class BookingsRepository(BaseRepository):
    model = BookingsModel
    schema = SBookingGet

    async def get_all(self) -> List[BookingsModel]:
        return await super().get_all()
    
    async def get_user_bookings(self, user_id: int):
        return await self.get_filtered(id_user=user_id)

    async def get_rent_bookings(self, rent_id: int):
        return await self.get_filtered(id_rents=rent_id)

    async def add_booking(self, data: SBookingAdd) -> SBookingGet:
        return await super().add(data)
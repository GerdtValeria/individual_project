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

    async def add(self, data: BaseModel):
        try:
            add_stmt = (
                insert(self.model)
                .values(**data.model_dump())
                .returning(self.model)
            )

            result = await self.session.execute(add_stmt)

            model = result.scalars().one_or_none()
            if model is None:
                return None
            return self.mapper.map_to_schema(model)

        except IntegrityError as ex:
            logging.error(
                f"Не удалось добавить данные в БД тип ошибки:{type(ex.orig.__cause__)=}"
            )

            if isinstance(ex.orig.__cause__, UniqueViolationError):
                raise ObjectAlreadyExistsException from ex
            else:
                logging.error(
                    f"Не незнакомая ошибка: тип ошибки:{type(ex.orig.__cause__)=}"
                )
                raise ex

    async def get_by_user_id(self, user_id: int) -> List[BookingsModel]:
        result = await self.session.execute(
            select(BookingsModel).where(BookingsModel.id_user == user_id)
        )
        return result.scalars().all()

    async def get_by_rent_id(self, rent_id: int) -> List[BookingsModel]:
        result = await self.session.execute(
            select(BookingsModel).where(BookingsModel.id_sents == rent_id)
        )
        return result.scalars().all()

    async def get_current_bookings(self) -> List[BookingsModel]:
        from datetime import date
        result = await self.session.execute(
            select(BookingsModel).where(BookingsModel.date_end >= date.today())
        )
        return result.scalars().all()
    
    async def get_user_bookings(self, user_id: int):
        return await self.get_filtered(id_user=user_id)

    async def get_rent_bookings(self, rent_id: int):
        return await self.get_filtered(id_rents=rent_id)

    async def add_booking(self, data: SBookingAdd) -> SBookingGet:
        return await super().add(data)
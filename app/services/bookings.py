from os import sync
from fastapi import HTTPException
from sqlalchemy import select
from app.api.bookings import SBookingAddRequest
from app.models.bookings import BookingsModel
from app.schemas.bookings import SBookingAdd, SBookingGet
from app.schemas.categories import SCategoriesGet
from app.services.base import BaseService
from app.repositories.bookings import BookingsRepository
from app.services.rents import RentService
from sqlalchemy.orm import selectinload


class BookingService(BaseService):
    async def get_all_bookings(self) -> list[SBookingGet]:
        bookings = await self.db.bookings.get_all()
        return bookings or []
    
    async def get_user_bookings(self, user_id: int) -> list[SBookingGet]:
        stmt = (
            select(BookingsModel)
            .where(BookingsModel.id_user == user_id)
            .options(selectinload(BookingsModel.rent))
        )
        result = await self.db.session.execute(stmt)  # session/async_session
        bookings = result.scalars().all()
        return bookings or []
    
    async def add_booking(self, data: SBookingAddRequest, user_id: int) -> SBookingGet:
       
        days_living = (data.date_end.day - data.date_start.day)
        rent = await RentService(self.db).get_rent(data.id_rents)
        price = rent.price
        cost = price * days_living


        booking_data = SBookingAdd(
            id_rents=data.id_rents,
            guests=data.guests,
            date_start=data.date_start,
            date_end=data.date_end,
            id_user=user_id,
            cost=cost
            )
        booking = await self.db.bookings.add_booking (booking_data)
        await self.db.commit()
        return booking 
        
    async def delete_booking(self, booking_id: int, user_id: int):
        deleted = await self.db.bookings.delete_by_id_and_user(booking_id, user_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Бронь не найдена")
        await self.db.commit()
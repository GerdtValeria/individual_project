from app.schemas.bookings import SBookingAdd, SBookingGet
from app.schemas.categories import SCategoriesGet
from app.services.base import BaseService
from app.repositories.bookings import BookingsRepository


class BookingService(BaseService):
    async def get_all_bookings(self) -> list[SBookingGet]:
        bookings = await self.db.bookings.get_all()
        return bookings or []
    
    async def get_user_bookings(self, user_id: int) -> list[SBookingGet]:
        bookings = await self.db.bookings.get_user_bookings(user_id)
        return bookings or [] 
    
    async def add_booking(self, booking_data: SBookingAdd) -> SBookingGet:
        booking = await self.db.bookings.add_booking (booking_data)
        await self.db.commit()
        return booking 
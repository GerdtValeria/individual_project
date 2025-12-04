from app.services.base import BaseService
from app.repositories.bookings import BookingsRepository


class BookingService(BaseService):
    async def get_all_bookings(self):
        return await BookingsRepository.get_all()
    
    async def add_category(self):
        return await BookingsRepository.add_booking()
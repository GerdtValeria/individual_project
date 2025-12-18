from app.schemas.bookings import SBookingAdd, SBookingGet
from app.models.bookings import BookingsModel
from app.repositories.base import BaseRepository

class BookingsRepository(BaseRepository):
    model = BookingsModel
    schema = SBookingGet

    async def get_all(self) -> list[BookingsModel]:
        return await super().get_all()
    
    async def get_user_bookings(self, user_id: int):
        return await self.get_filtered(id_user=user_id)

    async def get_rent_bookings(self, rent_id: int):
        return await self.get_filtered(id_rents=rent_id)

    async def add_booking(self, data: SBookingAdd) -> SBookingGet:
        return await super().add(data)
    
    async def delete_by_id_and_user(self, booking_id: int, user_id: int) -> int:
        return await self.delete(id=booking_id, id_user=user_id)


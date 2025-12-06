from app.api.dependencies import DBDep
from fastapi import APIRouter
from app.schemas.bookings import SBookingAdd, SBookingGet
from app.services.bookings import BookingService

router = APIRouter(prefix="/booking",tags=["Booking"])

@router.get("/", response_model=list[SBookingGet])
async def get_bookings(db: DBDep,) -> list[SBookingGet]:
    bookings = await BookingService(db).get_all_bookings()   
    return bookings

@router.get("/me", response_model=list[SBookingGet])
async def get_booking(db: DBDep,id:int,):
    booking = await BookingService(db).get_all_bookings(id=id)   
    return booking

@router.post("/", response_model=SBookingGet)
async def add_booking(booking_data: SBookingAdd, db: DBDep,) -> dict[str, str]:
    await BookingService(db).add_booking(booking_data)

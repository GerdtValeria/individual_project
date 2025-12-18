from app.api.dependencies import DBDep, UserIdDep
from fastapi import APIRouter
from app.schemas.bookings import SBookingAdd, SBookingAddRequest, SBookingGet
from app.services.bookings import BookingService

router = APIRouter(prefix="/booking",tags=["Booking"])

@router.get("/", response_model=list[SBookingGet])
async def get_bookings(db: DBDep,) -> list[SBookingGet]:
    bookings = await BookingService(db).get_all_bookings()   
    return bookings

@router.get("/me", response_model=list[SBookingGet])
async def get_booking(db: DBDep,user_id: UserIdDep,):
    booking = await BookingService(db).get_user_bookings(user_id)   
    return booking

@router.post("/", response_model=SBookingGet)
async def add_booking(
    booking_data: SBookingAddRequest,
    db: DBDep,
    user_id: UserIdDep,
):
    booking_full = SBookingAdd(
        **booking_data.model_dump(),
        id_user=user_id,
    )
    return await BookingService(db).add_booking(booking_full)


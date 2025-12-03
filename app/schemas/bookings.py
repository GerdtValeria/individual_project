from datetime import date
from pydantic import BaseModel, ConfigDict


class SBookingAddRequest(BaseModel):
    id_rent: int
    date_from: date
    date_to: date


class SBookingAdd(SBookingAddRequest):
    user_id: int
    price: int


class SBookingGet(SBookingAdd):
    id: int
    total_cost: int
    model_config = ConfigDict(from_attributes=True)


class SBookingPatchRequest(BaseModel):
    room_id: int | None = None
    date_from: date | None = None
    date_to: date | None = None


class SBookingPatch(SBookingPatchRequest):
    user_id: int | None = None
    price: int | None = None
    
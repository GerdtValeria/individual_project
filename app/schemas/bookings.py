from datetime import date
from pydantic import BaseModel, ConfigDict

from app.schemas.rents import SRentGet


class SBookingAddRequest(BaseModel):
    id_rents: int 
    guests: int
    date_start: date 
    date_end: date


class SBookingAdd(SBookingAddRequest):
    id_user: int  
    guests: int
    cost: int
    


class SBookingGet(BaseModel):
    id: int
    id_rents: int
    guests: int
    date_start: date
    date_end: date
    id_user: int
    cost: int
    model_config = ConfigDict(from_attributes=True)


class SBookingWithRent(SBookingGet):
    rent: SRentGet | None = None


class SBookingPatchRequest(BaseModel):
    id_rents: int | None = None
    date_start: date | None = None
    date_end: date | None = None


class SBookingPatch(SBookingPatchRequest):
    id_user: int | None = None
    cost: int | None = None
    
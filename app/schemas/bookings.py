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
    total_cost: int | None = None
    rent: SRentGet | None = None
    model_config = ConfigDict(from_attributes=True)


class SBookingPatchRequest(BaseModel):
    id_rents: int | None = None
    date_start: date | None = None
    date_end: date | None = None


class SBookingPatch(SBookingPatchRequest):
    id_user: int | None = None
    cost: int | None = None
    
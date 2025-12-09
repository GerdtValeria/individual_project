from datetime import date
from pydantic import BaseModel, ConfigDict


class SBookingAddRequest(BaseModel):
    id_rents: int 
    date_start: date 
    date_end: date


class SBookingAdd(SBookingAddRequest):
    id_user: int  
    cost: int


class SBookingGet(SBookingAdd):
    id: int
    # total_cost: int
    model_config = ConfigDict(from_attributes=True)


class SBookingPatchRequest(BaseModel):
    id_rents: int | None = None
    date_start: date | None = None
    date_end: date | None = None


class SBookingPatch(SBookingPatchRequest):
    id_user: int | None = None
    cost: int | None = None
    
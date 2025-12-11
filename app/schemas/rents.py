from pydantic import BaseModel, ConfigDict, Field


class SRent(BaseModel):
    id: int
    id_category: int 
    id_image: int
    id_user: int
    title: str = Field(...)
    price: int = Field(...)
    description: str = Field(..., min_length=10, max_length=65535)
    active: bool | None = None
    
class SRentAdd(BaseModel):
    id_category: int 
    id_image: int
    id_user: int
    title: str = Field(...)
    adress: str = Field(...)
    price: int = Field(...)
    description: str = Field(..., min_length=10, max_length=65535)

class SRentGet(SRentAdd):
    id: int
    model_config = ConfigDict(from_attributes=True)
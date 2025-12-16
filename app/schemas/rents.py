from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

from app.schemas.categories import SCategoriesGet
from app.schemas.images import SImagesGet
from app.schemas.users import SUserGet


class SRent(BaseModel):
    id_category: int 
    id_image: int | None = None
    id_user: int
    title: str = Field(..., min_length=1, max_length=50)
    address: str = Field(..., min_length=1, max_length=50) 
    price: int = Field(..., ge=0)
    description: str = Field(..., min_length=10, max_length=65535)
    active: Optional[bool] = True
    
class SRentAdd(BaseModel):
    id_category: int 
    id_image: int | None = None
    id_user: int
    title: str = Field(..., min_length=1, max_length=50)
    address: str = Field(..., min_length=1, max_length=50) 
    price: int = Field(..., ge=0)
    description: str = Field(..., min_length=10, max_length=65535)
    active: Optional[bool] = True

class SRentGet(SRentAdd):
    id: int
    id_image: Optional[int] = None  # Поле из модели
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class SRentGetWithRels(SRentAdd):
    id: int
    id_image: Optional[int] = None  # Поле из модели
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

    category: SCategoriesGet | None
    images: SImagesGet | None
    user: SUserGet | None
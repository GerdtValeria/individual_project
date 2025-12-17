from pydantic import BaseModel, ConfigDict, Field


class SImages(BaseModel):
    id: int
    image_url: str = Field(...)

class SImagesAdd(BaseModel):
    id: int
    image_url: str = Field(..., description="Адрес фотографии")
    
class SImagesGet(SImagesAdd):
    id: int
    id_rent: int
    model_config = ConfigDict(from_attributes=True)

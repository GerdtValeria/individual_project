from pydantic import BaseModel, Field


class SImages(BaseModel):
    id: int
    image_url: str = Field(...)

class SImagesAdd(BaseModel):
    id: int
    image_url: str = Field(..., description="Адрес фотографии")
    
class SImagesGet(SImagesAdd):
    id: int

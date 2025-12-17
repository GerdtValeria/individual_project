from pydantic import BaseModel, ConfigDict, Field


class SImages(BaseModel):
    id: int
    image_url: str = Field(...)

class SImagesAdd(BaseModel):
    image_url: str = Field(..., description="Адрес фотографии")
    
class SImagesGet(SImagesAdd):
    id: int
    model_config = ConfigDict(from_attributes=True)

from pydantic import BaseModel, ConfigDict, Field


class SCategories(BaseModel):
    id: int
    name: str = Field(...)

class SCategoriesAdd(BaseModel):
    name: str = Field(...)
    
class SCategoriesGet(SCategories):
    pass
    model_config = ConfigDict(from_attributes=True)

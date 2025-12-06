from pydantic import BaseModel, Field


class SCategories(BaseModel):
    id: int
    name: str = Field(...)

class SCategoriesAdd(BaseModel):
    name: str = Field(...)
    
class SCategoriesGet(SCategoriesAdd):
    name: str = Field(...)

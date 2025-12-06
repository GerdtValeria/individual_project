from pydantic import BaseModel, Field


class SCategories(BaseModel):
    name: str = Field(...)

class SCategoriesAdd(BaseModel):
    name: str = Field(...)
    
class SCategoriesGet(SCategoriesAdd):
    id: int

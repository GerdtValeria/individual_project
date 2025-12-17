from pydantic import BaseModel, ConfigDict, Field


class SComment(BaseModel):
    id:int
    id_user: int
    username: str | None = None
    id_rent: int
    content: str = Field(...,min_length=10, max_length=1000)
    
    model_config = ConfigDict(from_attributes=True)

class SCommentAdd(BaseModel):
    id_user: int
    id_rent: int
    content: str = Field(...,min_length=10, max_length=1000)
    
    model_config = ConfigDict(from_attributes=True)
    
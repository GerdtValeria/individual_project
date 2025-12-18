from pydantic import BaseModel, ConfigDict, Field

from app.schemas.users import SUserGet


class SComment(BaseModel):
    id:int
    id_user: int
    user: SUserGet | None = None
    id_rent: int
    content: str = Field(...,min_length=10, max_length=1000)
    
    model_config = ConfigDict(from_attributes=True)

class SCommentAdd(BaseModel):
    id_user: int
    id_rent: int
    content: str = Field(...,min_length=10, max_length=1000)
    
    model_config = ConfigDict(from_attributes=True)
    
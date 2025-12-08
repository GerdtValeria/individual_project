from pydantic import BaseModel, Field


class SComment(BaseModel):
    id:int
    id_user: int 
    id_rent: int
    content: str = Field(...,min_length=10, max_length=1000)

class SCommentAdd(BaseModel):
    content: str = Field(...,min_length=10, max_length=1000)
    
class SCommentGet(SCommentAdd):
    id: int

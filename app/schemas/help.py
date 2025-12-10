from pydantic import BaseModel, Field


class SHelp(BaseModel):
    id:int
    id_user: int 
    content: str = Field(...,min_length=10, max_length=1000)

class SHelpAdd(BaseModel):
    id_user: int 
    content: str = Field(...,min_length=10, max_length=1000)
    
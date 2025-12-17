from pydantic import BaseModel, ConfigDict, Field


class SHelp(BaseModel):
    id:int
    id_user: int
    content: str = Field(...,min_length=10, max_length=1000)
    
    model_config = ConfigDict(from_attributes=True)

class SHelpAdd(BaseModel):
    id_user: int
    content: str = Field(...,min_length=10, max_length=1000)
    
    model_config = ConfigDict(from_attributes=True)
    
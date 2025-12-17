from pydantic import BaseModel, ConfigDict, Field
from pydantic import BaseModel, ConfigDict, Field

class SFavoriteRent(BaseModel):
    id: int
    id_rent: int 
    id_user: int
    
class SFavoriteRentAdd(BaseModel):
    id_rent: int
    id_user: int

class SFavoriteRentGet(SFavoriteRentAdd):
    id: int
    model_config = ConfigDict(from_attributes=True)
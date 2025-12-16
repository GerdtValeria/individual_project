from typing import TYPE_CHECKING
from pydantic import BaseModel, ConfigDict, EmailStr
if TYPE_CHECKING:
    from app.schemas.roles import SRoleGet


class SUserAddRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role_id: int


class SUserAdd(BaseModel):
    name: str
    email: EmailStr
    hashed_password: str
    role_id: int


class SUserAuth(BaseModel):
    email: EmailStr
    password: str


class SUserGet(SUserAdd):
    id: int
    model_config = ConfigDict(from_attributes=True)


class SUserPatch(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    hashed_password: str | None = None
    role_id: int | None = None
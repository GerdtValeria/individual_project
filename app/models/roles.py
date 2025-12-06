from typing import TYPE_CHECKING
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.database import Base

if TYPE_CHECKING:
    from app.models.users import UserModel

class RoleModel(Base):
    __tablename__ = 'roles'
    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    
    users: Mapped[list["UserModel"]] = relationship(back_populates="role")

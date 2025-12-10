from typing import TYPE_CHECKING
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.database import Base

if TYPE_CHECKING:
    from app.models.users import UserModel

class HelpModel(Base):
    __tablename__ = 'help'
    id = Column(Integer, primary_key=True)
    id_user = Column(Integer, ForeignKey('users.id'))
    content = Column(String(1000))

    user: Mapped["UserModel"] = relationship(back_populates="help")
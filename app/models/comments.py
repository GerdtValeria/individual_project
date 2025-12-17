from typing import TYPE_CHECKING
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.database import Base

if TYPE_CHECKING:
    from app.models.rents import RentsModel
    from app.models.users import UserModel

class CommentsModel(Base):
    __tablename__ = 'comments'
    id = Column(Integer, primary_key=True)
    id_user = Column(Integer, ForeignKey('users.id'))
    id_rent = Column(Integer, ForeignKey('rents.id'))
    content = Column(String(1000))
    
    rent: Mapped["RentsModel"] = relationship(back_populates="comments")
    user: Mapped["UserModel"] = relationship(back_populates="comments")
    
    @property
    def username(self) -> str:
        return self.user.username if self.user else ""
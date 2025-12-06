from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.database import Base
from app.models.bookings import BookingsModel
from app.models.comments import CommentsModel
from app.models.rents import RentsModel
from app.models.roles import RoleModel


class UserModel(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    email = Column(String(50))
    role_id = Column(Integer, ForeignKey('roles.id'))
    password = Column(String(50))

role: Mapped["RoleModel"] = relationship(back_populates="users")
bookings: Mapped[list["BookingsModel"]] = relationship(back_populates="user")
rents: Mapped[list["RentsModel"]] = relationship(back_populates="user")
comments: Mapped[list["CommentsModel"]] = relationship(back_populates="user")
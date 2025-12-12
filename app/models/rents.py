from typing import TYPE_CHECKING
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.database import Base


if TYPE_CHECKING:
    from app.models.bookings import BookingsModel
    from app.models.categories import CategoriesModel
    from app.models.comments import CommentsModel
    from app.models.favorites import FavoritesModel
    from app.models.images import ImagesModel
    from app.models.users import UserModel

class RentsModel(Base):
    __tablename__ = 'rents'
    id = Column(Integer, primary_key=True)
    id_category = Column(Integer, ForeignKey('categories.id'))
    id_user = Column(Integer, ForeignKey('users.id'))
    title = Column(String(50))
    address = Column(String(50)) 
    price = Column(Integer)
    guests = Column(Integer)
    description = Column(String(65535))
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now()) 
    updated_at = Column(DateTime, onupdate=func.now())

    user: Mapped["UserModel"] = relationship(back_populates="rents")
    booking: Mapped["BookingsModel"] = relationship(back_populates="rent")
    images: Mapped[list["ImagesModel"]] = relationship(back_populates="rent")
    comments: Mapped[list["CommentsModel"]] = relationship(back_populates="rent")
    category: Mapped["CategoriesModel"] = relationship(back_populates="rent")
    favorites: Mapped["FavoritesModel"] = relationship(back_populates="rents")

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from app.database.database import Base

class RentsModel(Base):
    __tablename__ = 'rents'
    id = Column(Integer, primary_key=True)
    id_category = Column(Integer, ForeignKey('categories.id'))
    id_image = Column(Integer, ForeignKey('images.id'))
    id_user = Column(Integer, ForeignKey('users.id'))
    title = Column(String(50))
    price = Column(Integer)
    description = Column(String(65535))
    active = Column(Boolean)

users = relationship("UserModel", back_populates="rents")
bookings = relationship("BookingsModel", back_populates="rents")
images = relationship("ImagesModel", back_populates="rents")
comments = relationship("CommentsModel", back_populates="rents")
categories = relationship("CategoriesModel", back_populates="rents")
favorites = relationship("FavoritesModel", back_populates="rents")
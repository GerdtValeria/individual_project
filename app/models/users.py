from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database.database import Base

class UserModel(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    email = Column(String(50))
    role_id = Column(Integer, ForeignKey('roles.id'))
    password = Column(String(50))

role = relationship("RoleModel", back_populates="users")
bookings = relationship("BookingsModel", back_populates="user")
rents = relationship("RentsModel", back_populates="users")
comments = relationship("CommentsModel", back_populates="users")
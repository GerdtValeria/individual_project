from sqlalchemy import Column, Date, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database.database import Base


class BookingsModel(Base):
 __tablename__ = 'bookings'
 id = Column(Integer, primary_key=True)
 id_user = Column(Integer, ForeignKey('users.id'))
 id_rents = Column(Integer, ForeignKey('rents.id'))
 date_start = Column(Date) 
 date_end = Column(Date) 
 cost = Column(Integer) 

 user = relationship("UserModel", back_populates="bookings")
 rent = relationship("RentsModel", back_populates="bookings")

from typing import TYPE_CHECKING
from sqlalchemy import Column, Date, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.database import Base

if TYPE_CHECKING:
    from app.models.rents import RentsModel
    from app.models.users import UserModel

class BookingsModel(Base):
    __tablename__ = 'bookings'
    id = Column(Integer, primary_key=True)
    id_user = Column(Integer, ForeignKey('users.id'))
    id_rents = Column(Integer, ForeignKey('rents.id'))
    date_start = Column(Date) 
    date_end = Column(Date) 
    cost = Column(Integer) 

    @property
    def total_cost(self):
        days = (self.date_end - self.date_start).days
        return days * self.cost if days > 0 else self.cost

    rent: Mapped["RentsModel"] = relationship(back_populates="booking")
    user: Mapped["UserModel"] = relationship(back_populates="bookings")
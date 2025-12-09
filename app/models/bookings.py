from typing import TYPE_CHECKING
from sqlalchemy import Column, Date, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.hybrid import hybrid_property
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

    @hybrid_property
    def total_cost(self) -> int:
        return self.price * (self.date_to - self.date_from).days

    rent: Mapped["RentsModel"] = relationship(back_populates="booking")
    user: Mapped["UserModel"] = relationship(back_populates="bookings")
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.database import Base
from app.models.rents import RentsModel

class FavoritesModel(Base):
    __tablename__ = 'favorites'
    id = Column(Integer, primary_key=True)
    id_rent = Column(Integer, ForeignKey('rents.id'))
    id_user = Column(Integer, ForeignKey('users.id'))
    
rents: Mapped[list["RentsModel"]] = relationship(back_populates="favorites")

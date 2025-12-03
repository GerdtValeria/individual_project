from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from app.database.database import Base

class FavoritesModel(Base):
    __tablename__ = 'favorites'
    id = Column(Integer, primary_key=True)
    id_rent = Column(Integer, ForeignKey('rents.id'))
    id_user = Column(Integer, ForeignKey('users.id'))
    
rents = relationship("RentsModel", back_populates="favorites")
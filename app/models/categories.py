from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.database import Base
from app.models.rents import RentsModel

class CategoriesModel(Base):
    __tablename__ = 'categories'
    id = Column(Integer, primary_key=True)
    name = Column(String(255))
    
rents: Mapped[list["RentsModel"]] = relationship(back_populates="category")

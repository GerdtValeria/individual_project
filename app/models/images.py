from typing import TYPE_CHECKING
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.database import Base

if TYPE_CHECKING:
    from app.models.rents import RentsModel

class ImagesModel(Base):
    __tablename__ = 'images'
    id = Column(Integer, primary_key=True)
    image_url = Column(String(225))
    
    rent: Mapped["RentsModel"] = relationship(back_populates="images")

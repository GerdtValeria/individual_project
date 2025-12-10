from typing import TYPE_CHECKING
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.database import Base

if TYPE_CHECKING:
    from app.models.bookings import BookingsModel
    from app.models.comments import CommentsModel
    from app.models.rents import RentsModel
    from app.models.roles import RoleModel
    from app.models.help import HelpModel


class UserModel(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(300), nullable=False)
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id"), nullable=False)

    role: Mapped["RoleModel"] = relationship(back_populates="users")
    bookings: Mapped[list["BookingsModel"]] = relationship(back_populates="user")
    rents: Mapped[list["RentsModel"]] = relationship(back_populates="user")
    comments: Mapped[list["CommentsModel"]] = relationship(back_populates="user")
    help: Mapped[list["HelpModel"]] = relationship(back_populates="user")
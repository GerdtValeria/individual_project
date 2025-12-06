from datetime import datetime
from sqlalchemy import func
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from app.config import settings

engine = create_async_engine(settings.db_url)

async_session_maker = async_sessionmaker(bind=engine,
expire_on_commit=False)

class Base(DeclarativeBase):
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
    server_default=func.now(), onupdate=func.now()
)

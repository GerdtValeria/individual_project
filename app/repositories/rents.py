from sqlalchemy import select, and_
from typing import List, Optional
from app.models.rents import RentsModel
from app.repositories.base import BaseRepository
from app.schemas.favorites import SRentGet

class RentsRepository(BaseRepository):
    model = RentsModel
    schema = SRentGet

    async def get_all(self) -> List[RentsModel]:
        return await super().get_all()

    async def get_by_user_id(self, user_id: int) -> List[RentsModel]:
        result = await self.session.execute(
            select(RentsModel).where(RentsModel.id_user == user_id)
        )
        return result.scalars().all()

    async def get_by_category_id(self, category_id: int) -> List[RentsModel]:
        result = await self.session.execute(
            select(RentsModel).where(RentsModel.id_category == category_id)
        )
        return result.scalars().all()

    async def get_active_rents(self) -> List[RentsModel]:
        result = await self.session.execute(
            select(RentsModel).where(RentsModel.active == True)
        )
        return result.scalars().all()

    async def get_by_title(self, title: str) -> List[RentsModel]:
        result = await self.session.execute(
            select(RentsModel).where(RentsModel.title.ilike(f"%{title}%"))
        )
        return result.scalars().all()


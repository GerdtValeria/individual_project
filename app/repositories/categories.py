from sqlalchemy import select
from typing import List, Optional
from app.models.categories import CategoriesModel
from app.repositories.base import BaseRepository
from app.schemas.categories import SCategoriesGet

class CategoriesRepository(BaseRepository):
    model = CategoriesModel
    schema = SCategoriesGet

    async def get_all(self) -> List[CategoriesModel]:
        return await super().get_all()

    async def get_by_name(self, name: str) -> Optional[CategoriesModel]:
        result = await self.session.execute(
            select(CategoriesModel).where(CategoriesModel.name == name)
        )
        return result.scalar_one_or_none()
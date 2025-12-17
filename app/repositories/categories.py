from sqlalchemy import select
from typing import Optional
from app.models.categories import CategoriesModel
from app.repositories.base import BaseRepository
from app.schemas.categories import SCategoriesAdd, SCategoriesGet

class CategoriesRepository(BaseRepository):
    model = CategoriesModel
    schema = SCategoriesGet

    async def get_all(self) -> list[SCategoriesGet]:
        return await super().get_all()

    async def get_by_name(self, name: str) -> Optional[CategoriesModel]:
        result = await self.session.execute(
            select(CategoriesModel).where(CategoriesModel.name == name)
        )
        return result.scalar_one_or_none()
    
    async def add_category(self, data: SCategoriesAdd) -> SCategoriesGet:
        return await super().add(data)

    async def edit_category(self, category_id: int, data: SCategoriesAdd) -> None:
        await super().edit(data, id=category_id)

    async def delete_category(self, category_id: int) -> None:
        await super().delete(id=category_id)
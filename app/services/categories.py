from app.schemas.categories import SCategoriesAdd, SCategoriesGet
from app.services.base import BaseService
from app.repositories.categories import CategoriesRepository
from sqlalchemy.ext.asyncio import AsyncSession


class CategoryService(BaseService):
    def __init__(self, session: AsyncSession | None = None) -> None:
        self.repository = CategoriesRepository(session)

    async def get_all_categories(self) -> list[SCategoriesGet]:
        return await CategoriesRepository.get_all()
    
    async def add_category(self, category_data: SCategoriesAdd) -> SCategoriesGet:
        return await CategoriesRepository.add_category(category_data)
    
    async def edit_category(self, category_id: int, category_data: SCategoriesAdd) -> None:
        return await CategoriesRepository.edit_category(category_id, category_data)
    
    async def delete_category(self, category_id: int) -> None:
        return await CategoriesRepository.delete_category(category_id)
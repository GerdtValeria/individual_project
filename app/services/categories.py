from app.database.db_manager import DBManager
from app.schemas.categories import SCategoriesAdd, SCategoriesGet
from app.services.base import BaseService
from app.repositories.categories import CategoriesRepository


class CategoryService(BaseService):
    def __init__(self, db: DBManager | None = None) -> None:
        if db is None:
            raise ValueError("DBManager cannot be None for CategoryService")
      
        super().__init__(db)
        self.repository = CategoriesRepository(db)

    async def get_all_categories(self) -> list[SCategoriesGet]:
        return await self.repository.get_all()
    
    async def add_category(self, category_data: SCategoriesAdd) -> SCategoriesGet:
        return await self.repository.add_category(category_data)
    
    async def edit_category(self, category_id: int, category_data: SCategoriesAdd) -> None:
        return await self.repository.edit_category(category_id, category_data)
    
    async def delete_category(self, category_id: int) -> None:
        return await self.repository.delete_category(category_id)
from app.database.db_manager import DBManager
from app.schemas.categories import SCategoriesAdd, SCategoriesGet
from app.services.base import BaseService
from app.repositories.categories import CategoriesRepository


class CategoryService(BaseService):
  def __init__(self, db: DBManager | None = None) -> None:

  async def get_all_categories(self) -> list[SCategoriesGet]:
        return await self.db.categories.get_all()
    
  async def get_category(self) -> list[SCategoriesGet]:
        return await self.db.categories.get_by_name()

  async def add_category(self, category_data: SCategoriesAdd) -> SCategoriesGet:
        return await self.db.categories.add_category(category_data)
    
  async def edit_category(self, category_id: int, category_data: SCategoriesAdd) -> None:
        return await self.db.categories.edit_category(category_id, category_data)
    
  async def delete_category(self, category_id: int) -> None:
        return await self.db.categories.delete_category(category_id)
from app.database.db_manager import DBManager
from app.schemas.categories import SCategoriesAdd, SCategoriesGet
from app.services.base import BaseService
from app.repositories.categories import CategoriesRepository
from exceptions.base import ObjectAlreadyExistsException
from exceptions.categories import CategoryAlreadyExistsError, CategoryAlreadyExistsHTTPError


class CategoryService(BaseService):
    
      async def get_all_categories(self) -> list[SCategoriesGet]:
        categories = await self.db.categories.get_all()
        await self.db.commit()
        return categories
      
      async def get_category(self, category_name: str):
        category = await self.db.categories.get_by_name(name=category_name)
        await self.db.commit()
        return category

      async def add_category(self, category_data: SCategoriesAdd) -> SCategoriesGet:
        category = await self.db.categories.add_category(category_data)
        await self.db.commit()
        return category

      async def edit_category(self, category_id: int, category_data: SCategoriesAdd) -> None:
        category = await self.db.categories.edit_category(category_id, category_data)
        await self.db.commit()
        return category

      async def delete_category(self, id: int) -> None:
        await self.db.categories.delete_category(id)
        await self.db.commit()
        return {"message": f"Категория с id={id} успешно удалена"} 
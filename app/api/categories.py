from fastapi import APIRouter, Depends
from app.api.dependencies import DBDep, get_db
from app.database.db_manager import DBManager
from app.schemas.categories import SCategoriesAdd, SCategoriesGet
from app.services.categories import CategoryService
from sqlalchemy.ext.asyncio import AsyncSession

from exceptions.base import ObjectAlreadyExistsException, ObjectAlreadyExistsHTTPException

router = APIRouter(prefix="/categories",tags=["Category"])

@router.get("/", response_model=list[SCategoriesGet])
async def get_categories( db: DBDep,) -> list[SCategoriesGet]:
 categories = await CategoryService(db).get_all_categories()   
 return categories

@router.get("/{id}", response_model=SCategoriesGet)
async def get_category(id:int, db: DBDep,) -> dict[str, str]:
    category = await CategoryService(db).get_all_categories(id=id)   
    return category

@router.post("/", response_model=SCategoriesGet)
async def add_category(category_data: SCategoriesAdd, db: DBDep,) -> dict[str, str]:
    return await CategoryService(db).add_category(category_data)
      

@router.put("/{id}")
async def edit_category(id:int, category_data: SCategoriesAdd,db: DBDep,) -> dict[str, str]:
    await CategoryService(db).edit_category(id,category_data)
    return {"message": "Category updated successfully"}

@router.delete("/{id}")
async def delete_category(id:int, db: DBDep,) -> dict[str, str]:
     await CategoryService(db).delete_category(id=id)   
     return {"message": "Category deleted successfully"}

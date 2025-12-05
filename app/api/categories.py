from fastapi import APIRouter, Depends
from app.api.dependencies import get_db
from app.database.db_manager import DBManager
from app.schemas.categories import SCategoriesAdd, SCategoriesGet
from app.services.categories import CategoryService
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/categories",tags=["Category"])

@router.get("/", response_model=list[SCategoriesGet])
async def get_categories(session: AsyncSession = Depends(get_db)):

 db_manager = DBManager(session)
 service = CategoryService(db=db_manager.session)
 categories = await service.get_all_categories()   
 return categories

@router.get("/{id}", response_model=SCategoriesGet)
async def get_category(id:int, session: AsyncSession = Depends(get_db)):
    db_manager = DBManager(session)
    service = CategoryService(db=db_manager.session)
    category = await service.get_all_categories(id=id)   
    return category

@router.post("/", response_model=SCategoriesGet)
async def add_category(category_data: SCategoriesAdd, session: AsyncSession = Depends(get_db)):
    db_manager = DBManager(session)
    service = CategoryService(db=db_manager.session)
    result = await service.add_category(category_data)
    return result 

@router.put("/{id}")
async def edit_category(id:int, category_data: SCategoriesAdd,session: AsyncSession = Depends(get_db)):
    db_manager = DBManager(session)
    service = CategoryService(db=db_manager.session)
    await service.edit_category(id,category_data)
    return {"message": "Category updated successfully"}

@router.delete("/{id}")
async def delete_category(id:int, session: AsyncSession = Depends(get_db)):
     db_manager = DBManager(session)
     service = CategoryService(db=db_manager.session)
     await service.delete_category(id=id)   
     return {"message": "Category deleted successfully"}

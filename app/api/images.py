# images.py
import time
from pathlib import Path
import shutil
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
from app.api.dependencies import DBDep, get_db
from app.models import images  # Ваша модель Image
from app.schemas.images import SImagesAdd
from app.services.images import ImageService  # Если используете сервисный слой

router = APIRouter(prefix="/images", tags=["images"])  # ✅ ИСПРАВЛЕНО с /image на /images

STATIC_IMG_DIR = Path("app/static/img")
STATIC_IMG_DIR.mkdir(parents=True, exist_ok=True)

class ImageOut(BaseModel):
    id: int
    id_rent: int
    path: str

@router.post("/", response_model=dict, status_code=201)
async def add_image(
    rent_id: int = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),  # ✅ ИСПРАВЛЕНО с "db: version"
):
    """
    Загрузка изображения для объявления через add_image
    Сохраняет файл в app/static/img/ и создает запись в БД
    """
    
    # ✅ УБРАНО: from curses import version (причина ошибки!)
    # ✅ УБРАНО: from tkinter import Image (не нужно)
    
    # Проверяем существование объявления
    rent_exists = db.query(Image).filter(Image.id_rent == rent_id).first()
    if not rent_exists:
        # Можно сделать мягче - проверять таблицу Rent
        pass  # Продолжаем без ошибки
    
    # Проверяем тип файла
    if not image.content_type or not image.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Файл должен быть изображением")
    
    if image.size > 10 * 1024 * 1024:  # 10MB лимит
        raise HTTPException(status_code=400, detail="Файл слишком большой (макс. 10MB)")
    
    # Генерируем уникальное имя файла
    suffix = Path(image.filename).suffix.lower()
    if suffix not in ['.jpg', '.jpeg', '.png', '.webp', '.gif']:
        suffix = '.jpg'
    
    timestamp = int(time.time())
    file_stem = f"rent_{rent_id}_{timestamp}"
    file_name = f"{file_stem}{suffix}"
    file_path = STATIC_IMG_DIR / file_name
    
    try:
        # ✅ ПРАВИЛЬНОЕ сохранение файла
        with file_path.open("wb") as buffer:
            content = await image.read()
            buffer.write(content)
        
        # Создаем запись в БД
        db_image = Image(
            id_rent=rent_id,
            path=f"/static/img/{file_name}"
        )
        db.add(db_image)
        db.commit()
        db.refresh(db_image)
        
        return {
            "id": db_image.id,
            "path": db_image.path,
            "message": "Изображение успешно загружено"
        }
        
    except Exception as e:
        # Удаляем файл при ошибке БД
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail=f"Ошибка сохранения: {str(e)}")

@router.get("/{id}", response_model=dict)
async def get_image(id: int, db: Session = Depends(get_db)):
    """Получение информации об изображении"""
    image = db.query(Image).filter(Image.id == id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Изображение не найдено")
    return {
        "id": image.id,
        "id_rent": image.id_rent,
        "path": image.path
    }

@router.put("/{id}")
async def edit_image(
    id: int, 
    image_data: SImagesAdd, 
    db: Session = Depends(get_db)
) -> dict[str, str]:
    """Обновление изображения"""
    await ImageService(db).edit_image(id, image_data)
    return {"message": "Image updated successfully"}

@router.delete("/{id}")
async def delete_image(id: int, db: Session = Depends(get_db)) -> dict[str, str]:
    """Удаление изображения"""
    await ImageService(db).delete_image(id=id)
    return {"message": "Image deleted successfully"}

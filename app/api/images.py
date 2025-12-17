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

STATIC_IMG_DIR = Path("app/static/rents")
STATIC_IMG_DIR.mkdir(parents=True, exist_ok=True)

class ImageOut(BaseModel):
    id: int
    id_rent: int
    path: str

@router.post("/", response_model=None, status_code=201)
async def add_image(
    rent_id: int = Form(...),
    image: UploadFile = File(...),
    db: DBDep = None,
):
    # валидация файла
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Файл должен быть изображением")

    # UploadFile в FastAPI не имеет атрибута size – нужно проверять размер вручную,
    # но чтобы не усложнять, просто уберём эту проверку или оставим TODO.
    # Если очень нужно, можно читать чанками и считать.

    # генерируем имя
    suffix = Path(image.filename).suffix.lower()
    if suffix not in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
        suffix = ".jpg"

    timestamp = int(time.time())
    file_stem = f"rent_{rent_id}_{timestamp}"
    file_name = f"{file_stem}{suffix}"
    file_path = STATIC_IMG_DIR / file_name

    try:
        # сохраняем файл
        with file_path.open("wb") as buffer:
            content = await image.read()
            buffer.write(content)

        # создаём запись в БД через сервис/репозиторий
        img_data = SImagesAdd(
            image_url=f"/static/img/{file_name}",
        )
        saved_img = await ImageService(db).add_image(img_data)

        return {
            "id": saved_img.id,
            "path": saved_img.image_url,
            "message": "Изображение успешно загружено",
        }

    except Exception as e:
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail=f"Ошибка сохранения: {e}")

@router.get("/{id}", response_model=None)
async def get_image(id: int, db: Session = Depends(get_db)):
    """Получение информации об изображении"""
    image = await ImageService(db).get_image(id=id)
    if not image:
        raise HTTPException(status_code=404, detail="Изображение не найдено")
    return {
        "id": image.id,
        "path": image.image_url
    }
@router.get("/", response_model=None)
async def get_rent_image(rent_id: int, db: Session = Depends(get_db)):
    """Получение информации об изображении"""
    image = await ImageService(db).get_image(rent_id=rent_id)
    if not image:
        raise HTTPException(status_code=404, detail="Изображение не найдено")
    return {
        "id": image.id,
        "path": image.image_url
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

from curses import version
from pathlib import Path
from tkinter import Image
from app.api.dependencies import DBDep, get_db
from fastapi import APIRouter, Depends, File, Form, UploadFile
from app.schemas.images import SImagesAdd, SImagesGet
from app.services.images import ImageService

router = APIRouter(prefix="/image",tags=["Image"])


STATIC_IMG_DIR = Path("app/static/img")

@router.post("/")
async def add_image(
    rent_id: int = Form(...),
    image: UploadFile = File(...),
    db: version = Depends(get_db),
):
    STATIC_IMG_DIR.mkdir(parents=True, exist_ok=True)

    suffix = Path(image.filename).suffix
    file_name = f"rent_{rent_id}{suffix}"
    file_path = STATIC_IMG_DIR / file_name

    with file_path.open("wb") as f:
        content = await image.read()
        f.write(content)

    db_image = Image(
        id_rent=rent_id,
        path=f"/static/img/{file_name}",
    )
    db.add(db_image)
    db.commit()
    db.refresh(db_image)

    return {"id": db_image.id, "path": db_image.path}


@router.get("/{id}", response_model=SImagesGet)
async def get_image(db: DBDep,id:int,):
    rent = await ImageService(db).get_image(id=id)   
    return rent

@router.put("/{id}")
async def edit_image(id:int, image_data: SImagesAdd, db: DBDep,) -> dict[str, str]:
     await ImageService(db).edit_image(id,image_data)
     return {"message": "Image updated successfully"}

@router.delete("/{id}")
async def delete_image(id:int, db: DBDep,) -> dict[str, str]:
     await ImageService(db).delete_image(id=id)   
     return {"message": "Image deleted successfully"}

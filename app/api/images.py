from app.api.dependencies import DBDep
from fastapi import APIRouter
from app.schemas.images import SImagesAdd, SImagesGet
from app.services.images import ImageService

router = APIRouter(prefix="/image",tags=["Image"])


@router.get("/{id}", response_model=SImagesGet)
async def get_шьфпу(db: DBDep,id:int,):
    rent = await ImageService(db).get_image(id=id)   
    return rent

@router.post("/", response_model=SImagesGet)
async def add_image(image_data: SImagesAdd, db: DBDep,) -> dict[str, str]:
     image = await ImageService(db).add_image(image_data)
     return image

@router.put("/{id}")
async def edit_image(id:int, image_data: SImagesAdd, db: DBDep,) -> dict[str, str]:
     await ImageService(db).edit_image(id,image_data)
     return {"message": "Image updated successfully"}

@router.delete("/{id}")
async def delete_image(id:int, db: DBDep,) -> dict[str, str]:
     await ImageService(db).delete_image(id=id)   
     return {"message": "Image deleted successfully"}

from app.schemas.images import SImagesAdd, SImagesGet
from app.services.base import BaseService
from app.repositories.images import ImagesRepository


class ImageService(BaseService):
    async def get_image(self, id: int | None = None, rent_id: int | None = None):
        image = ""
        if id:
            await self.db.images.get_one_or_none(id=id)        
        elif rent_id:
            rent = await self.db.rents.get_one_or_none(id=rent_id)
            id_img = rent.id_image
            image = await self.db.images.get_one_or_none(id=id_img)
        return image

    async def add_image(self, image_data: SImagesAdd) -> SImagesGet:
        image = await self.db.images.add_image(image_data)
        await self.db.commit()
        return image
    
    async def edit_image(self, image_id: int, image_data: SImagesAdd) -> None:
        image = await self.db.images.edit_image(image_id,image_data)
        await self.db.commit()
        return image
    
    async def delete_image(self, id: int) -> None:
        await self.db.images.delete_image(id)
        await self.db.commit()
        return {"message": f"Изображение с id={id} успешно удалено"} 
from app.schemas.images import SImagesAdd, SImagesGet
from app.services.base import BaseService
from app.repositories.images import ImagesRepository


class ImageService(BaseService):
    async def get_all_images(self) -> list[SImagesGet]:
        images = await self.db.images.get_all()
        return images

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
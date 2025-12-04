from sqlalchemy import select
from typing import List
from app.models.images import ImagesModel
from app.repositories.base import BaseRepository
from app.schemas.images import SImagesAdd, SImagesGet

class ImagesRepository(BaseRepository):
    model = ImagesModel
    schema = SImagesGet

    async def add_image(self, data: SImagesAdd) -> SImagesGet:
        return await super().add(data)

    async def edit_image(self, image_id: int, data: SImagesAdd) -> None:
        await super().edit(data, id=image_id)

    async def delete_image(self, image_id: int) -> None:
        await super().delete(id=image_id)
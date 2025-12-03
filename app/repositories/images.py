from sqlalchemy import select
from typing import List
from app.models.images import ImagesModel
from app.repositories.base import BaseRepository
from app.schemas.images import SImagesGet

class ImagesRepository(BaseRepository):
    model = ImagesModel
    schema = SImagesGet

    async def get_all(self) -> List[ImagesModel]:
        return await super().get_all()

    async def get_by_rent_id(self, rent_id: int) -> List[ImagesModel]:
        result = await self.session.execute(
            select(ImagesModel).where(ImagesModel.id == rent_id)  # исправьте на правильное поле связи
        )
        return result.scalars().all()
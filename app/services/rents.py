from app.services.base import BaseService
from app.repositories.rents import RentsRepository


class RentService(BaseService):
    async def get_all_rents(self):
        return await RentsRepository.get_all()
    
    async def add_rent(self):
        return await RentsRepository.add_rent()
    
    async def edit_rent(self):
        return await RentsRepository.edit_rent()
    
    async def delete_rent(self):
        return await RentsRepository.delete_rent()
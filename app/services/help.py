from app.repositories.help import HelpRepository
from app.schemas.help import SHelpAdd, SHelp
from app.services.base import BaseService
from app.repositories.comments import CommentsRepository

class HelpService(BaseService):
    async def get_all_help(self) -> list[SHelp]:
        helps = await HelpRepository.get_all()
        return helps
    
    async def add_help(self, help_data: SHelpAdd) -> SHelp:
        help = await self.db.help.add_help(help_data)
        await self.db.commit()
        return help
    
    
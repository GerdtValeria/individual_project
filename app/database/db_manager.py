from app.database.database import async_session_maker
from app.repositories.bookings import BookingsRepository
from app.repositories.categories import CategoriesRepository
from app.repositories.comments import CommentsRepository
from app.repositories.help import HelpRepository
from app.repositories.images import ImagesRepository
from app.repositories.rents import RentsRepository
from app.repositories.roles import RolesRepository
from app.repositories.users import UsersRepository
from app.repositories.favorites import FavoritesRepository


class DBManager:
    def __init__(self, session_factory):
        self.session_factory = session_factory

    async def __aenter__(self):
        self.session = self.session_factory()
        self.users = UsersRepository(self.session)
        self.bookings = BookingsRepository(self.session)
        self.rents = RentsRepository(self.session)
        self.categories = CategoriesRepository(self.session)
        self.comments = CommentsRepository(self.session)
        self.images = ImagesRepository(self.session)
        self.roles = RolesRepository(self.session)
        self.favorites = FavoritesRepository(self.session)
        self.help = HelpRepository(self.session)
        return self

    async def __aexit__(self, *args):
        await self.session.rollback()
        await self.session.close()

    async def commit(self):
        await self.session.commit()
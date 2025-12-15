import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    SECRET_KEY='ej08rj4wg09dnviesr03wjg'
    ALGORITHM='HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES=60
    DB_NAME='test.db'
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env")
    )  

    @property
    def db_url(self):
        return ('sqlite+aiosqlite:///db.sqlite3')

    @property
    def auth_data(self):
        return {"secret_key": settings.SECRET_KEY, "algorithm": settings.ALGORITHM}
     
settings = Settings()

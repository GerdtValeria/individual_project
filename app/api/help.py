from app.api.dependencies import DBDep, UserIdDep
from fastapi import APIRouter
from app.schemas.help import SHelpAdd, SHelp
from app.services.help import HelpService

router = APIRouter(prefix="/help",tags=["Help"])

@router.get("/{rent_id}/comments", response_model=list[SHelp])
async def get_help( db: DBDep,) -> list[SHelp]:
    help = await HelpService(db).get_all_helps()   
    return help

@router.post("/", response_model=SHelp)
async def add_help(content:str, db: DBDep, user_id: UserIdDep,) -> dict[str, str]:
    help_data = SHelpAdd(user_id, content)
    help = await HelpService(db).add_help(help_data)
    return help


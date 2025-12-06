from app.api.dependencies import DBDep
from fastapi import APIRouter
from app.schemas.comments import SCommentAdd, SCommentGet
from app.services.comments import CommentService

router = APIRouter(prefix="/comments",tags=["Comment"])

@router.get("/", response_model=list[SCommentGet])
async def get_comments( db: DBDep,) -> list[SCommentGet]:
 comments = await CommentService(db).get_all_comments()   
 return comments

@router.post("/")
async def add_comment(comment_data: SCommentAdd):
    await CommentService().add_comment(comment_data)

@router.put("/{id}")
async def edit_comment(id:int, comment_data: SCommentAdd):
    data_comment = await CommentService().edit_comment(id,comment_data)
    return data_comment

@router.delete("/{id}")
async def delete_comment(id:int):
     await CommentService().delete_comment(id=id)   

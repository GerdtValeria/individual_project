from app.api.dependencies import DBDep, UserIdDep
from fastapi import APIRouter
from app.schemas.comments import SCommentAdd, SComment
from app.services.comments import CommentService

router = APIRouter(prefix="/rent/{rent_id}/comments",tags=["Comment"])

@router.get("/", response_model=list[SComment])
async def get_comments( db: DBDep,) -> list[SComment]:
 comments = await CommentService(db).get_all_comments()   
 return comments

@router.post("/", response_model=SComment)
async def add_comment(content:str, db: DBDep, user_id: UserIdDep,) -> dict[str, str]:
    comment_data = SCommentAdd(rent_id, user_id, content)
    comment = await CommentService(db).add_comment(comment_data)
    return comment

@router.put("/{id}")
async def edit_comment(id:int, comment_data: SCommentAdd,db: DBDep,) -> dict[str, str]:
    await CommentService(db).edit_comment(id,comment_data)
    return {"message": "Comment updated successfully"}

@router.delete("/{id}")
async def delete_comment(id:int, db: DBDep,) -> dict[str, str]:
     await CommentService().delete_comment(id=id)  
     return {"message": "Comment deleted successfully"} 

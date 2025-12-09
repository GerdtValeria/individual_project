from app.api.dependencies import DBDep, UserIdDep
from fastapi import APIRouter
from app.schemas.comments import SCommentAdd, SComment
from app.services.comments import CommentService

router = APIRouter(prefix="/rent",tags=["Comment"])

@router.get("/{rent_id}/comments", response_model=list[SComment])
async def get_comments( db: DBDep,) -> list[SComment]:
    comments = await CommentService(db).get_all_comments()   
    return comments

@router.post("/{rent_id}/comments", response_model=SComment)
async def add_comment( rent_id: int, content:str, db: DBDep, user_id: UserIdDep,) -> dict[str, str]:
    comment_data = SCommentAdd(rent_id, user_id, content)
    comment = await CommentService(db).add_comment(comment_data)
    return comment

@router.put("/{rent_id}/comments/{id}")
async def edit_comment(id:int, comment_data: SCommentAdd,db: DBDep, user_id: UserIdDep,) -> dict[str, str]:
    await CommentService(db).edit_comment(id,comment_data)
    return {"message": "Comment updated successfully"}

@router.delete("/{rent_id}/comments/{id}")
async def delete_comment(id:int, db: DBDep, user_id: UserIdDep,) -> dict[str, str]:
    await CommentService(db).delete_comment(id=id)  
    return {"message": "Comment deleted successfully"} 

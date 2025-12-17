from app.api.dependencies import DBDep, UserIdDep
from fastapi import APIRouter, Body
from app.schemas.comments import SCommentAdd, SComment
from app.services.comments import CommentService

router = APIRouter(prefix="/rents",tags=["Comment"])

@router.get("/{rent_id}/comments", response_model=list[SComment])
async def get_comments(rent_id: int, db: DBDep,) -> list[SComment]:
    comments = await CommentService(db).get_rent_comments(rent_id)   
    return comments

@router.post("/{rent_id}/comments", response_model=SComment)
async def add_comment(
    rent_id: int,
    db: DBDep,
    user_id: UserIdDep,
    content: str = Body(..., embed=True),
) -> SComment:
    comment_data = SCommentAdd(        
        id_user=user_id,
        id_rent=rent_id,
        content=content,)
    comment = await CommentService(db).add_comment(comment_data)
    return comment

@router.put("/{rent_id}/comments/{id}")
async def edit_comment(    
    rent_id: int,
    id: int,
    db: DBDep,
    user_id: UserIdDep,
    content: str = Body(..., embed=True),) -> dict[str, str]:
    comment_data = SCommentAdd(
        id_user=user_id,
        id_rent=rent_id,
        content=content,)
    await CommentService(db).edit_comment(id,comment_data)
    return {"message": "Comment updated successfully"}

@router.delete("/{rent_id}/comments/{id}")
async def delete_comment(id:int, db: DBDep, user_id: UserIdDep,) -> dict[str, str]:
    await CommentService(db).delete_comment(id=id)  
    return {"message": "Comment deleted successfully"} 

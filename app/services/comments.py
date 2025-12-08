from app.schemas.comments import SCommentAdd, SComment
from app.services.base import BaseService
from app.repositories.comments import CommentsRepository

class CommentService(BaseService):
    async def get_all_comments(self) -> list[SComment]:
        comments = await CommentsRepository.get_all()
        return comments
    
    async def add_comment(self, comment_data: SCommentAdd) -> SComment:
        comment = await self.db.comments.add_comment(comment_data)
        await self.db.commit()
        return comment
    
    async def edit_comment(self, comment_id: int, comment_data: SCommentAdd) -> None:
        comment = await self.db.comments.add_comment(comment_id, comment_data)
        await self.db.commit()
        return comment
    
    async def delete_comment(self, id: int) -> None:
        await self.db.comments.delete_comment(id)
        await self.db.commit()
        return {"message": f"Комментарий с id={id} успешно удален"} 
    
from fastapi import HTTPException, status

class TokenExpiredException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )

class NoJwtException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="JWT token not found"
        )

class NoUserIdException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not found in token"
        )

class ForbiddenException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden"
        )

class MyAppException(Exception):
    detail = "Неожиданная ошибка"

    def __init__(self, *args, **kwargs):
        super().__init__(self.detail, *args, **kwargs)


class MyAppHTTPException(HTTPException):
    status_code = 500
    detail = "Неожиданная ошибка"

    def __init__(self):
        super().__init__(status_code=self.status_code, detail=self.detail)


class ObjectNotFoundException(MyAppException):
    detail = "Объект не найден"


class ObjectAlreadyExistsException(MyAppException):
    detail = "Похожий объект уже существует"


class InvalidDateRangeException(MyAppException):
    detail = "Дата заезда не может быть позже даты выезда"

class UserNotFoundException(Exception):
    detail = "Пользователь не найден"
    def __init__(self, user_id: int = None, email: str = None):
        if user_id:
            message = f"User with id {user_id} not found"
        elif email:
            message = f"User with email {email} not found"
        else:
            message = "User not found"
        super().__init__(message)

class BookingNotFoundException(Exception):
    detail = "Бронирование не найдено"
    def __init__(self, booking_id: int):
        super().__init__(f"Booking with id {booking_id} not found")

class RentNotFoundException(Exception):
    detail = "Аренда не найдена"
    def __init__(self, rent_id: int):
        super().__init__(f"Rent with id {rent_id} not found")

class CategoryNotFoundException(Exception):
    detail = "Категория не найдена"
    def __init__(self, category_id: int = None, name: str = None):
        if category_id:
            message = f"Category with id {category_id} not found"
        elif name:
            message = f"Category with name {name} not found"
        else:
            message = "Category not found"
        super().__init__(message)

class PermissionDeniedException(Exception):
    detail = "Доступ запрещен"
    def __init__(self, message: str = "Permission denied"):
        super().__init__(message)
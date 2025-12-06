from exceptions.base import MyAppException, MyAppHTTPException


class CategoryNotFoundError(MyAppException):
    detail = "Роли не существует"


class CategoryNotFoundHTTPError(MyAppHTTPException):
    status_code = 404
    detail = "Роли не существует"


class CategoryAlreadyExistsError(MyAppException):
    detail = "Такая роль уже существует"


class CategoryAlreadyExistsHTTPError(MyAppHTTPException):
    status_code = 409
    detail = "Такая роль уже существует"
from exceptions.base import MyAppException, MyAppHTTPException


class RoleNotFoundError(MyAppException):
    detail = "Роли не существует"


class RoleNotFoundHTTPError(MyAppHTTPException):
    status_code = 404
    detail = "Роли не существует"


class RoleAlreadyExistsError(MyAppException):
    detail = "Такая роль уже существует"


class RoleAlreadyExistsHTTPError(MyAppHTTPException):
    status_code = 409
    detail = "Такая роль уже существует"
from exceptions.base import MyAppException, MyAppHTTPException


class UserAlreadyExistsError(MyAppHTTPException):
    detail = "Пользователь с таким email уже существует"


class InvalidJWTTokenError(MyAppHTTPException):
    detail = "Неверный токен"


class JWTTokenExpiredError(MyAppHTTPException):
    detail = "Токен истек, необходимо снова авторизоваться"


class InvalidPasswordError(MyAppHTTPException):
    detail = "Неверный пароль"


class UserNotFoundError(MyAppHTTPException):
    detail = "Пользователя не существует"


class InvalidTokenHTTPError(MyAppHTTPException):
    status_code = 401
    detail = "Неверный токен доступа"


class JWTTokenExpiredHTTPError(MyAppHTTPException):
    status_code = 401
    detail = "Токен истек, необходимо снова авторизоваться"


class NoAccessTokenHTTPError(MyAppHTTPException):
    detail = "Вы не предоставили токен доступа"
    status_code = 401


class UserAlreadyExistsHTTPError(MyAppHTTPException):
    status_code = 409
    detail = "Пользователь с таким email уже существует"


class UserNotFoundHTTPError(MyAppHTTPException):
    status_code = 401
    detail = "Пользователя не существует"


class InvalidPasswordHTTPError(MyAppHTTPException):
    status_code = 401
    detail = "Неверный пароль"
from fastapi import HTTPException

from exceptions.base import MyAppException, MyAppHTTPException


class RentNotFoundException(MyAppException):
    detail = "Номера не существует"


class RentNotFoundHTTPException(MyAppHTTPException):
    status_code = 404
    detail = "Номера не существует"

class InvalidRentFilterException(Exception):
    def __init__(self, detail: str):
        self.detail = detail
        super().__init__(detail)
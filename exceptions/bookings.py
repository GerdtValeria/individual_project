from exceptions.base import MyAppException, MyAppHTTPException, BookingNotFoundException


class RealtyNotAvailableException(MyAppException):
    detail = "Номер недоступен для бронирования"


class RealtyNotAvailableHTTPException(MyAppHTTPException):
    status_code = 409
    detail = "Номер недоступен для бронирования"

class BookingNotFoundException(Exception):
    detail = "Бронирование не найдено"
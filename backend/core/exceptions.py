"""Excepciones personalizadas para la aplicación"""

from typing import Any, Optional


class AppException(Exception):
    """Excepción base de la aplicación"""

    def __init__(
        self, message: str, status_code: int = 500, details: Optional[Any] = None
    ):
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(self.message)

    def to_dict(self):
        """Convertir excepción a diccionario para respuestas HTTP"""
        return {"message": self.message, "details": self.details}


class ValidationException(AppException):
    """Excepción para errores de validación de datos"""

    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(message, status_code=400, details=details)


class NotFoundException(AppException):
    """Excepción para recursos no encontrados"""

    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(message, status_code=404, details=details)


class BusinessLogicException(AppException):
    """Excepción para errores de lógica de negocio"""

    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(message, status_code=422, details=details)


class AuthenticationException(AppException):
    """Excepción para errores de autenticación"""

    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(message, status_code=401, details=details)


class AuthorizationException(AppException):
    """Excepción para errores de autorización"""

    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(message, status_code=403, details=details)

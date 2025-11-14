class ConfiaTradError(Exception):
    def __init__(self, message: str, status_code: int = 500, details: dict = None):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class NotFoundError(ConfiaTradError):
    def __init__(self, resource: str, identifier: str = None):
        message = f"{resource} no encontrado"
        if identifier:
            message += f": {identifier}"
        super().__init__(message, status_code=404, details={"resource": resource, "identifier": identifier})


class ValidationError(ConfiaTradError):
    def __init__(self, field: str, message: str, value=None):
        super().__init__(
            f"Error de validación en '{field}': {message}",
            status_code=400,
            details={"field": field, "value": value}
        )


class DuplicateError(ConfiaTradError):
    def __init__(self, resource: str, field: str, value: str):
        super().__init__(
            f"{resource} ya existe con {field} = '{value}'",
            status_code=409,
            details={"resource": resource, "field": field, "value": value}
        )


class BusinessRuleError(ConfiaTradError):
    def __init__(self, rule: str, message: str):
        super().__init__(
            f"Regla de negocio violada: {message}",
            status_code=422,
            details={"rule": rule}
        )


class AuthenticationError(ConfiaTradError):
    def __init__(self, message: str = "Credenciales inválidas"):
        super().__init__(message, status_code=401)


class AuthorizationError(ConfiaTradError):
    def __init__(self, message: str = "No tiene permisos para realizar esta acción"):
        super().__init__(message, status_code=403)


class DatabaseError(ConfiaTradError):
    def __init__(self, operation: str, original_error: Exception = None):
        message = f"Error de base de datos en operación: {operation}"
        details = {"operation": operation}
        if original_error:
            details["original_error"] = str(original_error)
        super().__init__(message, status_code=500, details=details)


class ExternalServiceError(ConfiaTradError):
    def __init__(self, service: str, operation: str, original_error: Exception = None):
        message = f"Error en servicio externo '{service}' durante: {operation}"
        details = {"service": service, "operation": operation}
        if original_error:
            details["original_error"] = str(original_error)
        super().__init__(message, status_code=502, details=details)

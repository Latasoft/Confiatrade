class ConfiaTradError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)


class NotFoundError(ConfiaTradError):
    pass


class ValidationError(ConfiaTradError):
    pass


class AuthenticationError(ConfiaTradError):
    pass


class EmpresaNotFoundError(NotFoundError):
    pass


class ParticipanteNotFoundError(NotFoundError):
    pass

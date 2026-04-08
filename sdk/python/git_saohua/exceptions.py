"""Custom exceptions for git_saohua SDK."""


class SaohuaError(Exception):
    """Base exception for all Saohua SDK errors."""

    pass


class APIError(SaohuaError):
    """Exception raised when API returns an error response."""

    def __init__(
        self, message: str, status_code: int = None, response_data: dict = None
    ):
        self.message = message
        self.status_code = status_code
        self.response_data = response_data
        super().__init__(self.message)


class TimeoutError(SaohuaError):
    """Exception raised when request times out."""

    pass


class NetworkError(SaohuaError):
    """Exception raised for network-related errors."""

    pass

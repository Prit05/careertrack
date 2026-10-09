class CareerTrackError(Exception):
    """Base exception for expected application errors."""


class ResourceNotFoundError(CareerTrackError):
    """Raised when a requested resource does not exist."""


class OwnershipError(CareerTrackError):
    """Raised when a resource does not belong to the user."""


class InvalidResourceError(CareerTrackError):
    """Raised when supplied resource data is invalid."""
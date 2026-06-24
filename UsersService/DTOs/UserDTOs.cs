namespace UsersService.DTOs;

public record UserResponse(
    string Id,
    string FirstName,
    string LastName,
    string Email,
    string? AddressLine1,
    string? AddressLine2,
    string? City,
    string? PostalCode,
    string? Country,
    DateTime CreatedAt,
    DateTime? LastLoginAt
);

public record UpdateProfileRequest(
    string? FirstName,
    string? LastName,
    string? AddressLine1,
    string? AddressLine2,
    string? City,
    string? PostalCode,
    string? Country
);

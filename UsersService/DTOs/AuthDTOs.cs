namespace UsersService.DTOs;

public record RegisterRequest(
    string FirstName,
    string LastName,
    string Email,
    string Password
);

public record LoginRequest(
    string Email,
    string Password
);

public record AuthResponse(
    string Token,
    string RefreshToken,
    DateTime ExpiresAt,
    UserResponse User
);

public record RefreshTokenRequest(
    string RefreshToken
);

using UsersService.DTOs;

namespace UsersService.Services;

public interface IUserService
{
    Task<UserResponse> GetByIdAsync(string id);
    Task<UserResponse> UpdateProfileAsync(string id, UpdateProfileRequest request);
}

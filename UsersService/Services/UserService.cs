using Mapster;
using Microsoft.AspNetCore.Identity;
using UsersService.DTOs;
using UsersService.Models;

namespace UsersService.Services;

public class UserService : IUserService
{
    private readonly UserManager<AppUser> _userManager;

    public UserService(UserManager<AppUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<UserResponse> GetByIdAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id)
            ?? throw new KeyNotFoundException("User not found.");

        return user.Adapt<UserResponse>();
    }

    public async Task<UserResponse> UpdateProfileAsync(string id, UpdateProfileRequest request)
    {
        var user = await _userManager.FindByIdAsync(id)
            ?? throw new KeyNotFoundException("User not found.");

        if (request.FirstName is not null) user.FirstName = request.FirstName;
        if (request.LastName is not null) user.LastName = request.LastName;
        if (request.AddressLine1 is not null) user.AddressLine1 = request.AddressLine1;
        if (request.AddressLine2 is not null) user.AddressLine2 = request.AddressLine2;
        if (request.City is not null) user.City = request.City;
        if (request.PostalCode is not null) user.PostalCode = request.PostalCode;
        if (request.Country is not null) user.Country = request.Country;

        await _userManager.UpdateAsync(user);

        return user.Adapt<UserResponse>();
    }
}

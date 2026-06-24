using OrdersService.DTOs;

namespace OrdersService.Services;

public interface ICartService
{
    Task<CartResponse> GetCartAsync(string userId);
    Task<CartResponse> AddItemAsync(string userId, AddToCartRequest request);
    Task<CartResponse> UpdateItemAsync(string userId, Guid cartItemId, UpdateCartItemRequest request);
    Task RemoveItemAsync(string userId, Guid cartItemId);
    Task ClearCartAsync(string userId);
}

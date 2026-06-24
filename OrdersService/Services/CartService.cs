using Microsoft.EntityFrameworkCore;
using OrdersService.Data;
using OrdersService.DTOs;
using OrdersService.Models;
using System.Text.Json;
namespace OrdersService.Services;

public class CartService : ICartService
{
    private readonly OrdersDbContext _context;

    
private readonly HttpClient _httpClient;

public CartService(OrdersDbContext context, IHttpClientFactory httpClientFactory)
{
    _context = context;
    _httpClient = httpClientFactory.CreateClient();
}

    public async Task<CartResponse> GetCartAsync(string userId)
    {
        var cart = await GetOrCreateCartAsync(userId);
        return MapToResponse(cart);
    }

    public async Task<CartResponse> AddItemAsync(string userId, AddToCartRequest request)
{
    var cart = await GetOrCreateCartAsync(userId);

    // Proveri stock
    var stockResponse = await _httpClient.GetAsync(
        $"http://localhost:5003/api/books/{request.BookId}/stock");
    
    if (stockResponse.IsSuccessStatusCode)
    {
        var stockJson = await stockResponse.Content.ReadAsStringAsync();
        var stockData = JsonSerializer.Deserialize<JsonElement>(stockJson);
        var stockQuantity = stockData.GetProperty("stockQuantity").GetInt32();

        var existingItem = cart.Items.FirstOrDefault(i => i.BookId == request.BookId);
        var currentInCart = existingItem?.Quantity ?? 0;

        if (currentInCart + request.Quantity > stockQuantity)
            throw new InvalidOperationException($"Not enough stock. Only {stockQuantity - currentInCart} available.");
    }

        
        

        // If same book already in cart, increase quantity
        var existing = cart.Items.FirstOrDefault(i => i.BookId == request.BookId);
        if (existing is not null)
        {
            existing.Quantity += request.Quantity;
            existing.UnitPrice = request.UnitPrice; // update price in case it changed
        }
        else
        {
            cart.Items.Add(new CartItem
            {
                CartId = cart.Id,
                BookId = request.BookId,
                BookTitle = request.BookTitle,
                UnitPrice = request.UnitPrice,
                Quantity = request.Quantity
            });
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return MapToResponse(cart);
    }

public async Task<CartResponse> UpdateItemAsync(string userId, Guid cartItemId, UpdateCartItemRequest request)
{
    var cart = await GetOrCreateCartAsync(userId);

    var item = cart.Items.FirstOrDefault(i => i.Id == cartItemId)
        ?? throw new KeyNotFoundException("Cart item not found.");

    // Proveri stock
    var stockResponse = await _httpClient.GetAsync(
        $"http://localhost:5003/api/books/{item.BookId}/stock");

    if (stockResponse.IsSuccessStatusCode)
    {
        var stockJson = await stockResponse.Content.ReadAsStringAsync();
        var stockData = JsonSerializer.Deserialize<JsonElement>(stockJson);
        var stockQuantity = stockData.GetProperty("stockQuantity").GetInt32();

        if (request.Quantity > stockQuantity)
            throw new InvalidOperationException($"Not enough stock. Only {stockQuantity} available.");
    }

    item.Quantity = request.Quantity;
    cart.UpdatedAt = DateTime.UtcNow;
    await _context.SaveChangesAsync();

    return MapToResponse(cart);
}

    public async Task RemoveItemAsync(string userId, Guid cartItemId)
    {
        var cart = await GetOrCreateCartAsync(userId);

        var item = cart.Items.FirstOrDefault(i => i.Id == cartItemId)
            ?? throw new KeyNotFoundException("Cart item not found.");

        _context.CartItems.Remove(item);
        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    public async Task ClearCartAsync(string userId)
    {
        var cart = await GetOrCreateCartAsync(userId);
        _context.CartItems.RemoveRange(cart.Items);
        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private async Task<Cart> GetOrCreateCartAsync(string userId)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart is not null) return cart;

        cart = new Cart { UserId = userId };
        _context.Carts.Add(cart);
        await _context.SaveChangesAsync();

        return cart;
    }

    private static CartResponse MapToResponse(Cart cart) => new(
        cart.Id,
        cart.UserId,
        cart.Total,
        cart.Items.Select(i => new CartItemResponse(
            i.Id, i.BookId, i.BookTitle, i.UnitPrice, i.Quantity, i.Subtotal
        )).ToList()
    );
}

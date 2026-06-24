using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrdersService.DTOs;
using OrdersService.Services;

namespace OrdersService.Controllers;

[ApiController]
[Route("cart")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    // GET /cart
    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var cart = await _cartService.GetCartAsync(userId);
        return Ok(cart);
    }

    // POST /cart/items
    [HttpPost("items")]
    public async Task<IActionResult> AddItem([FromBody] AddToCartRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var cart = await _cartService.AddItemAsync(userId, request);
        return Ok(cart);
    }

    // PUT /cart/items/{itemId}
    [HttpPut("items/{itemId:guid}")]
    public async Task<IActionResult> UpdateItem(Guid itemId, [FromBody] UpdateCartItemRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var cart = await _cartService.UpdateItemAsync(userId, itemId, request);
        return Ok(cart);
    }

    // DELETE /cart/items/{itemId}
    [HttpDelete("items/{itemId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid itemId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        await _cartService.RemoveItemAsync(userId, itemId);
        return NoContent();
    }

    // DELETE /cart
    [HttpDelete]
    public async Task<IActionResult> ClearCart()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        await _cartService.ClearCartAsync(userId);
        return NoContent();
    }
}

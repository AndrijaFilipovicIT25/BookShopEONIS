using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrdersService.DTOs;
using OrdersService.Services;

namespace OrdersService.Controllers;

[ApiController]
[Route("orders")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    // POST /orders/checkout — guests and logged-in users
    [HttpPost("checkout")]
    [AllowAnonymous]
    public async Task<IActionResult> Checkout([FromBody] CheckoutRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var result = await _orderService.CheckoutAsync(userId, request);
        return Ok(result);
    }

    // GET /orders/my — logged-in user's order history
    [HttpGet("my")]
    [Authorize]
    public async Task<IActionResult> GetMyOrders()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var orders = await _orderService.GetUserOrdersAsync(userId);
        return Ok(orders);
    }

    // GET /orders/{id} — get single order
    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var order = await _orderService.GetByIdAsync(id, userId);
        return Ok(order);
    }

    // GET /orders — samo Admin, sve porudžbine
[HttpGet]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> GetAllOrders()
{
    var orders = await _orderService.GetAllOrdersAsync();
    return Ok(orders);
}
}

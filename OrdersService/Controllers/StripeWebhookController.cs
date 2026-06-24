using Microsoft.AspNetCore.Mvc;
using OrdersService.Services;

namespace OrdersService.Controllers;

[ApiController]
[Route("stripe")]
public class StripeWebhookController : ControllerBase
{
    private readonly IOrderService _orderService;

    public StripeWebhookController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    // POST /stripe/webhook
    [HttpPost("webhook")]
    public async Task<IActionResult> Webhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        var stripeSignature = Request.Headers["Stripe-Signature"];

        await _orderService.HandleStripeWebhookAsync(json, stripeSignature!);

        return Ok();
    }
}

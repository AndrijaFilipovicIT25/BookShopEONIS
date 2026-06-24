using OrdersService.DTOs;

namespace OrdersService.Services;

public interface IOrderService
{
    Task<CheckoutResponse> CheckoutAsync(string? userId, CheckoutRequest request);
    Task<OrderResponse> GetByIdAsync(Guid orderId, string? userId);
    Task<List<OrderResponse>> GetUserOrdersAsync(string userId);
    Task HandleStripeWebhookAsync(string json, string stripeSignature);
    Task<List<OrderResponse>> GetAllOrdersAsync();
}

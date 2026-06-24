using Mapster;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using OrdersService.Configuration;
using OrdersService.Data;
using OrdersService.DTOs;
using OrdersService.Models;
using Stripe;

namespace OrdersService.Services;

public class OrderService : IOrderService
{
    private readonly OrdersDbContext _context;
    private readonly StripeSettings _stripeSettings;

    private readonly IHttpClientFactory _httpClientFactory;

public OrderService(OrdersDbContext context, IOptions<StripeSettings> stripeSettings, IHttpClientFactory httpClientFactory)
{
    _context = context;
    _stripeSettings = stripeSettings.Value;
    _httpClientFactory = httpClientFactory;
    StripeConfiguration.ApiKey = _stripeSettings.SecretKey;
}

    public async Task<CheckoutResponse> CheckoutAsync(string? userId, CheckoutRequest request)
    {
        // Guest validation
        if (userId is null)
        {
            if (string.IsNullOrWhiteSpace(request.GuestEmail))
                throw new InvalidOperationException("Guest email is required.");
            if (string.IsNullOrWhiteSpace(request.GuestFirstName) || string.IsNullOrWhiteSpace(request.GuestLastName))
                throw new InvalidOperationException("Guest name is required.");
        }

        var total = request.Items.Sum(i => i.UnitPrice * i.Quantity);

        // Create Stripe Payment Intent
        var paymentIntentService = new PaymentIntentService();
        var paymentIntent = await paymentIntentService.CreateAsync(new PaymentIntentCreateOptions
        {
            Amount = (long)(total * 100), // Stripe uses cents
            Currency = "usd",
            Metadata = new Dictionary<string, string>
            {
                { "userId", userId ?? "guest" }
            }
        });

        // Create Order
        var order = new Order
        {
            UserId = userId,
            GuestEmail = request.GuestEmail ?? string.Empty,
            GuestFirstName = request.GuestFirstName ?? string.Empty,
            GuestLastName = request.GuestLastName ?? string.Empty,
            AddressLine1 = request.AddressLine1,
            AddressLine2 = request.AddressLine2,
            City = request.City,
            PostalCode = request.PostalCode,
            Country = request.Country,
            TotalAmount = total,
            StripePaymentIntentId = paymentIntent.Id,
            Status = OrderStatus.Pending,
            Items = request.Items.Select(i => new OrderItem
            {
                BookId = i.BookId,
                BookTitle = i.BookTitle,
                UnitPrice = i.UnitPrice,
                Quantity = i.Quantity
            }).ToList()
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        return new CheckoutResponse(order.Id, paymentIntent.ClientSecret, total);
    }

    public async Task<OrderResponse> GetByIdAsync(Guid orderId, string? userId)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId)
            ?? throw new KeyNotFoundException("Order not found.");

        // Logged in users can only see their own orders
        if (userId is not null && order.UserId != userId)
            throw new UnauthorizedAccessException("Access denied.");

        return MapToResponse(order);
    }

public async Task<List<OrderResponse>> GetAllOrdersAsync()
{
    var orders = await _context.Orders
        .Include(o => o.Items)
        .OrderByDescending(o => o.CreatedAt)
        .ToListAsync();

    return orders.Select(MapToResponse).ToList();
}
    public async Task<List<OrderResponse>> GetUserOrdersAsync(string userId)
    {
        var orders = await _context.Orders
            .Include(o => o.Items)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return orders.Select(MapToResponse).ToList();
    }

    public async Task HandleStripeWebhookAsync(string json, string stripeSignature)
    {
        var stripeEvent = EventUtility.ConstructEvent(json, stripeSignature, _stripeSettings.WebhookSecret);
var _httpClient = _httpClientFactory.CreateClient();
        if (stripeEvent.Type == EventTypes.PaymentIntentSucceeded)
        {
            var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
            if (paymentIntent is null) return;

           var order = await _context.Orders
    .Include(o => o.Items)
    .FirstOrDefaultAsync(o => o.StripePaymentIntentId == paymentIntent.Id);

            if (order is not null)
            {
                order.Status = OrderStatus.Confirmed;
order.UpdatedAt = DateTime.UtcNow;

// Smanji stock za svaku knjigu
foreach (var item in order.Items)
{
    var reduceResponse = await _httpClient.PutAsJsonAsync(
        $"http://localhost:5003/api/books/{item.BookId}/reduce-stock",
        new { quantity = item.Quantity });
    
    Console.WriteLine($"ReduceStock for book {item.BookId}, qty {item.Quantity}: {reduceResponse.StatusCode}");
}

await _context.SaveChangesAsync();
            }
        }

        if (stripeEvent.Type == EventTypes.PaymentIntentPaymentFailed)
        {
            var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
            if (paymentIntent is null) return;

var order = await _context.Orders
    .Include(o => o.Items)
    .FirstOrDefaultAsync(o => o.StripePaymentIntentId == paymentIntent.Id);

            if (order is not null)
            {
                order.Status = OrderStatus.Cancelled;
                order.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }
    }

    // ── Mapping ───────────────────────────────────────────────────────────────

    private static OrderResponse MapToResponse(Order order) => new(
        order.Id,
        order.UserId,
        order.GuestEmail,
        order.GuestFirstName,
        order.GuestLastName,
        order.AddressLine1,
        order.AddressLine2,
        order.City,
        order.PostalCode,
        order.Country,
        order.Status.ToString(),
        order.TotalAmount,
        order.CreatedAt,
        order.Items.Select(i => new OrderItemResponse(
            i.Id, i.BookId, i.BookTitle, i.UnitPrice, i.Quantity, i.Subtotal
        )).ToList()
    );
}

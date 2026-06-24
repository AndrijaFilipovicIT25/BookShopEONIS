namespace OrdersService.Models;

public class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // Null for guest orders
    public string? UserId { get; set; }

    // Guest info — required when UserId is null
    public string GuestEmail { get; set; } = string.Empty;
    public string GuestFirstName { get; set; } = string.Empty;
    public string GuestLastName { get; set; } = string.Empty;

    // Shipping address snapshot
    public string AddressLine1 { get; set; } = string.Empty;
    public string? AddressLine2 { get; set; }
    public string City { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;

    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public decimal TotalAmount { get; set; }

    // Stripe
    public string? StripePaymentIntentId { get; set; }

    // Meta
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();

    public bool IsGuestOrder => UserId is null;
}

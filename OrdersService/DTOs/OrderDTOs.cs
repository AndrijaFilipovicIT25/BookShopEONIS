namespace OrdersService.DTOs;

// ── Checkout ──────────────────────────────────────────────────────────────────

public record CheckoutItemRequest(
    string BookId,
    string BookTitle,
    decimal UnitPrice,
    int Quantity
);

public record CheckoutRequest(
    // Guest only — ignored for logged-in users
    string? GuestEmail,
    string? GuestFirstName,
    string? GuestLastName,

    // Shipping
    string AddressLine1,
    string? AddressLine2,
    string City,
    string PostalCode,
    string Country,

    List<CheckoutItemRequest> Items
);

public record CheckoutResponse(
    Guid OrderId,
    string ClientSecret,  // Stripe Payment Intent client secret
    decimal TotalAmount
);

// ── Orders ────────────────────────────────────────────────────────────────────

public record OrderItemResponse(
    Guid Id,
    string BookId,
    string BookTitle,
    decimal UnitPrice,
    int Quantity,
    decimal Subtotal
);

public record OrderResponse(
    Guid Id,
    string? UserId,
    string GuestEmail,
    string GuestFirstName,
    string GuestLastName,
    string AddressLine1,
    string? AddressLine2,
    string City,
    string PostalCode,
    string Country,
    string Status,
    decimal TotalAmount,
    DateTime CreatedAt,
    List<OrderItemResponse> Items
);

namespace OrdersService.DTOs;

public record AddToCartRequest(
    string BookId,
    string BookTitle,
    decimal UnitPrice,
    int Quantity
);

public record UpdateCartItemRequest(
    int Quantity
);

public record CartItemResponse(
    Guid Id,
    string BookId,
    string BookTitle,
    decimal UnitPrice,
    int Quantity,
    decimal Subtotal
);

public record CartResponse(
    Guid Id,
    string UserId,
    decimal Total,
    List<CartItemResponse> Items
);

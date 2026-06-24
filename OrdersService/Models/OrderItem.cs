namespace OrdersService.Models;

public class OrderItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrderId { get; set; }

    public string BookId { get; set; } = string.Empty;

    // Snapshots taken at purchase time
    public string BookTitle { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal Subtotal => UnitPrice * Quantity;

    public Order Order { get; set; } = null!;
}

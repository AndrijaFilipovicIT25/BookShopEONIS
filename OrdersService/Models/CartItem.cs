namespace OrdersService.Models;

public class CartItem
{
    public Guid Id { get; set; } 
    public Guid CartId { get; set; }

    public string BookId { get; set; } = string.Empty;

    // Fetched from Books Service when added, then stored as snapshot
    public string BookTitle { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal Subtotal => UnitPrice * Quantity;

    public Cart Cart { get; set; } = null!;
}

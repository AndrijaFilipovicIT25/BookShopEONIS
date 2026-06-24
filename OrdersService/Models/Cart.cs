namespace OrdersService.Models;

public class Cart
{
    public Guid Id { get; set; } 
    public string UserId { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();

    public decimal Total => Items.Sum(i => i.Subtotal);
}

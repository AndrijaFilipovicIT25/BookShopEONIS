using Microsoft.EntityFrameworkCore;
using OrdersService.Models;

namespace OrdersService.Data;

public class OrdersDbContext : DbContext
{
    public OrdersDbContext(DbContextOptions<OrdersDbContext> options)
        : base(options) { }

    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.HasDefaultSchema("Orders");

        builder.Entity<Order>(e =>
        {
            e.HasKey(o => o.Id);
            e.Property(o => o.TotalAmount).HasPrecision(18, 2);
            e.HasMany(o => o.Items)
             .WithOne(i => i.Order)
             .HasForeignKey(i => i.OrderId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<OrderItem>(e =>
        {
            e.HasKey(i => i.Id);
            e.Property(i => i.UnitPrice).HasPrecision(18, 2);
            e.Ignore(i => i.Subtotal); // computed, not stored
        });

        builder.Entity<Cart>(e =>
        {
            e.HasKey(c => c.Id);
            e.HasIndex(c => c.UserId).IsUnique(); // one cart per user
            e.HasMany(c => c.Items)
             .WithOne(i => i.Cart)
             .HasForeignKey(i => i.CartId)
             .OnDelete(DeleteBehavior.Cascade);
            e.Ignore(c => c.Total); // computed, not stored
        });

        builder.Entity<CartItem>(e =>
        {
            e.HasKey(i => i.Id);
            e.Property(i => i.UnitPrice).HasPrecision(18, 2);
            e.Ignore(i => i.Subtotal); // computed, not stored
        });
    }
}

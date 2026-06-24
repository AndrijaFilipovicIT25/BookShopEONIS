using Microsoft.EntityFrameworkCore;
using BooksService.Models;

namespace BooksService.Data;

public class BooksDbContext : DbContext
{
    public BooksDbContext(DbContextOptions<BooksDbContext> options)
        : base(options) { }

    public DbSet<Book> Books { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Author> Authors { get; set; }
    public DbSet<BookAuthor> BookAuthors { get; set; }
    public DbSet<Collection> Collections { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.HasDefaultSchema("Books");

        // ─── Book ────────────────────────────────────────────────────
        builder.Entity<Book>(b =>
        {
            b.HasKey(x => x.Id);

            b.Property(x => x.Title)
                .IsRequired()
                .HasMaxLength(255);

            b.Property(x => x.ISBN)
                .IsRequired()
                .HasMaxLength(20);

            b.HasIndex(x => x.ISBN)
                .IsUnique();

            b.Property(x => x.Price)
                .HasPrecision(18, 2);

            b.Property(x => x.DiscountPrice)
                .HasPrecision(18, 2);

            b.Property(x => x.Height)
                .HasPrecision(10, 2);

            b.Property(x => x.Width)
                .HasPrecision(10, 2);

            b.Property(x => x.Depth)
                .HasPrecision(10, 2);

            b.Property(x => x.Language)
                .HasMaxLength(50);

            b.Property(x => x.Publisher)
                .HasMaxLength(255);

            b.Property(x => x.PaperColor)
                .HasMaxLength(50);

            // Foreign Key to Category
            b.HasOne(x => x.Category)
                .WithMany(c => c.Books)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Foreign Key to Collection (optional)
            b.HasOne(x => x.Collection)
                .WithMany(c => c.Books)
                .HasForeignKey(x => x.CollectionId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false);

            // Many-to-many Authors
            b.HasMany(x => x.BookAuthors)
                .WithOne(ba => ba.Book)
                .HasForeignKey(ba => ba.BookId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ─── Collection ──────────────────────────────────────────────
        builder.Entity<Collection>(c =>
        {
            c.HasKey(x => x.Id);

            c.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(100);

            c.HasIndex(x => x.Name)
                .IsUnique();
        });

        // ─── Category ────────────────────────────────────────────────
        builder.Entity<Category>(c =>
        {
            c.HasKey(x => x.Id);

            c.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(100);

            c.HasIndex(x => x.Name)
                .IsUnique();
        });

        // ─── Author ──────────────────────────────────────────────────
        builder.Entity<Author>(a =>
        {
            a.HasKey(x => x.Id);

            a.Property(x => x.FirstName)
                .IsRequired()
                .HasMaxLength(100);

            a.Property(x => x.LastName)
                .IsRequired()
                .HasMaxLength(100);

            // Many-to-many Authors
            a.HasMany(x => x.BookAuthors)
                .WithOne(ba => ba.Author)
                .HasForeignKey(ba => ba.AuthorId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ─── BookAuthor (Explicit Join) ──────────────────────────────
        builder.Entity<BookAuthor>(ba =>
        {
            ba.HasKey(x => new { x.BookId, x.AuthorId });

            ba.HasOne(x => x.Book)
                .WithMany(b => b.BookAuthors)
                .HasForeignKey(x => x.BookId)
                .OnDelete(DeleteBehavior.Cascade);

            ba.HasOne(x => x.Author)
                .WithMany(a => a.BookAuthors)
                .HasForeignKey(x => x.AuthorId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}

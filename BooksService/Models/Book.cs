namespace BooksService.Models;

public class Book
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }

    public string ISBN { get; set; } = string.Empty; // Unique
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }

    // Dimensions (cm)
    public decimal? Height { get; set; }
    public decimal? Width { get; set; }
    public decimal? Depth { get; set; }

    // Appearance
    public string? PaperColor { get; set; }

    // Publishing info
    public string? Language { get; set; }
    public int? PublishedYear { get; set; }
    public string? Publisher { get; set; }
    public int? PageCount { get; set; }

    // Images (local storage: wwwroot/uploads/books/{bookId}/...)
    public string? FrontImagePath { get; set; }
    public string? BackImagePath { get; set; }
    public string? SpineImagePath { get; set; }

    // Status
    public bool IsAvailable { get; set; } = true;
    public int StockQuantity { get; set; } = 0;  
    public bool IsActive { get; set; } = true; // Soft delete

    // Foreign Key
    public int CategoryId { get; set; }
    public Category? Category { get; set; }

    // Collection (optional — e.g. "Naruto", "Harry Potter")
    public int? CollectionId { get; set; }
    public Collection? Collection { get; set; }
    public int? CollectionOrder { get; set; }

    // Many-to-many Authors via BookAuthor
    public ICollection<BookAuthor> BookAuthors { get; set; } = [];

    // Meta
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

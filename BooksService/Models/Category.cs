namespace BooksService.Models;

public class Category
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty; // Unique
    public string? Description { get; set; }

    // Reverse navigation
    public ICollection<Book> Books { get; set; } = [];
}

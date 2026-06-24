namespace BooksService.Models;

public class BookAuthor
{
    // Composite primary key: BookId + AuthorId
    public int BookId { get; set; }
    public int AuthorId { get; set; }

    // Navigation properties
    public Book Book { get; set; } = null!;
    public Author Author { get; set; } = null!;
}

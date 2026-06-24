namespace BooksService.Models;

public class Author
{
    public int Id { get; set; }

    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Bio { get; set; }

    // Many-to-many Books via BookAuthor
    public ICollection<BookAuthor> BookAuthors { get; set; } = [];
}

using Mapster;
using BooksService.Data;
using BooksService.DTOs;
using BooksService.Models;
using Microsoft.EntityFrameworkCore;

namespace BooksService.Services;

public class BookService : IBookService
{
    private readonly BooksDbContext _context;
    private readonly IWebHostEnvironment _environment;
    private const long MaxFileSize = 5 * 1024 * 1024; // 5MB
    private readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".webp" };

    public BookService(BooksDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    // ─── Books ────────────────────────────────────────────────────────────
    public async Task<BookResponse> GetBookByIdAsync(int id)
    {
        var book = await _context.Books
            .Include(b => b.Category)
            .Include(b => b.Collection)
            .Include(b => b.BookAuthors)
                .ThenInclude(ba => ba.Author)
            .FirstOrDefaultAsync(b => b.Id == id && b.IsActive)
            ?? throw new KeyNotFoundException($"Book with ID {id} not found.");

        return MapBookToResponse(book);
    }

    public async Task<List<BookResponse>> GetBooksAsync(int pageNumber = 1, int pageSize = 10)
    {
        var books = await _context.Books
            .Where(b => b.IsActive)
            .Include(b => b.Category)
            .Include(b => b.Collection)
            .Include(b => b.BookAuthors)
                .ThenInclude(ba => ba.Author)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return books.Select(MapBookToResponse).ToList();
    }

    public async Task<BookResponse> CreateBookAsync(CreateBookRequest request)
    {
        // Check if ISBN already exists
        var existingBook = await _context.Books
            .FirstOrDefaultAsync(b => b.ISBN == request.ISBN);

        if (existingBook is not null)
            throw new InvalidOperationException($"Book with ISBN {request.ISBN} already exists.");

        // Verify category exists
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == request.CategoryId)
            ?? throw new KeyNotFoundException($"Category with ID {request.CategoryId} not found.");

        // Verify all authors exist
        if (request.AuthorIds is null || request.AuthorIds.Count == 0)
            throw new InvalidOperationException("At least one author is required.");

        var authors = await _context.Authors
            .Where(a => request.AuthorIds.Contains(a.Id))
            .ToListAsync();

        if (authors.Count != request.AuthorIds.Count)
            throw new KeyNotFoundException("One or more authors not found.");

        // Verify collection exists if provided
        if (request.CollectionId.HasValue)
        {
            var collection = await _context.Collections
                .FirstOrDefaultAsync(c => c.Id == request.CollectionId.Value)
                ?? throw new KeyNotFoundException($"Collection with ID {request.CollectionId} not found.");
        }

        var book = request.Adapt<Book>();
        book.Category = category;

        _context.Books.Add(book);
        await _context.SaveChangesAsync();

        // Add authors
        foreach (var author in authors)
        {
            _context.BookAuthors.Add(new BookAuthor { BookId = book.Id, AuthorId = author.Id });
        }

        await _context.SaveChangesAsync();

        return await GetBookByIdAsync(book.Id);
    }

    public async Task<BookResponse> UpdateBookAsync(int id, UpdateBookRequest request)
    {
        var book = await _context.Books
            .Include(b => b.BookAuthors)
            .FirstOrDefaultAsync(b => b.Id == id && b.IsActive)
            ?? throw new KeyNotFoundException($"Book with ID {id} not found.");

        // Update category if provided
        if (request.CategoryId.HasValue)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == request.CategoryId.Value)
                ?? throw new KeyNotFoundException($"Category with ID {request.CategoryId} not found.");

            book.CategoryId = request.CategoryId.Value;
        }

        // Update authors if provided
        if (request.AuthorIds is not null && request.AuthorIds.Count > 0)
        {
            var authors = await _context.Authors
                .Where(a => request.AuthorIds.Contains(a.Id))
                .ToListAsync();

            if (authors.Count != request.AuthorIds.Count)
                throw new KeyNotFoundException("One or more authors not found.");

            // Remove existing authors
            _context.BookAuthors.RemoveRange(book.BookAuthors);

            // Add new authors
            foreach (var author in authors)
            {
                _context.BookAuthors.Add(new BookAuthor { BookId = book.Id, AuthorId = author.Id });
            }
        }

        // Update collection if provided
        if (request.CollectionId.HasValue)
        {
            var collection = await _context.Collections
                .FirstOrDefaultAsync(c => c.Id == request.CollectionId.Value)
                ?? throw new KeyNotFoundException($"Collection with ID {request.CollectionId} not found.");

            book.CollectionId = request.CollectionId.Value;
        }
        else if (request.CollectionId == null && request.CollectionOrder == null)
        {
            // Explicitly passing null removes book from collection
            book.CollectionId = null;
            book.CollectionOrder = null;
        }

        if (request.CollectionOrder.HasValue)
            book.CollectionOrder = request.CollectionOrder.Value;

        // Update other properties using Mapster (only non-null values)
        request.Adapt(book);

        _context.Books.Update(book);
        await _context.SaveChangesAsync();

        return await GetBookByIdAsync(book.Id);
    }

    public async Task DeleteBookAsync(int id)
    {
        var book = await _context.Books
            .FirstOrDefaultAsync(b => b.Id == id && b.IsActive)
            ?? throw new KeyNotFoundException($"Book with ID {id} not found.");

        // Soft delete
        book.IsActive = false;
        _context.Books.Update(book);
        await _context.SaveChangesAsync();
    }

    public async Task<string> UploadSingleImageAsync(int bookId, IFormFile image, string imageType)
    {
        var book = await _context.Books
            .FirstOrDefaultAsync(b => b.Id == bookId && b.IsActive)
            ?? throw new KeyNotFoundException($"Book with ID {bookId} not found.");

        var uploadDir = Path.Combine(_environment.WebRootPath, "uploads", "books", bookId.ToString());
        Directory.CreateDirectory(uploadDir);

        var imagePath = await SaveImageAsync(image, uploadDir, imageType);

        // Update book with the image path based on imageType
        switch (imageType.ToLower())
        {
            case "front":
                book.FrontImagePath = imagePath;
                break;
            case "back":
                book.BackImagePath = imagePath;
                break;
            case "spine":
                book.SpineImagePath = imagePath;
                break;
            default:
                throw new InvalidOperationException($"Invalid image type: {imageType}. Must be 'front', 'back', or 'spine'.");
        }

        _context.Books.Update(book);
        await _context.SaveChangesAsync();

        return imagePath;
    }

    private async Task<string> SaveImageAsync(IFormFile file, string uploadDir, string imageType)
    {
        if (file.Length > MaxFileSize)
            throw new InvalidOperationException($"File size exceeds maximum allowed size of {MaxFileSize / (1024 * 1024)}MB.");

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(ext))
            throw new InvalidOperationException($"File type '{ext}' is not allowed. Allowed types: {string.Join(", ", AllowedExtensions)}");

        var fileName = $"{imageType}{ext}";
        var filePath = Path.Combine(uploadDir, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Return relative path for URL
        return $"/uploads/books/{Path.GetFileName(uploadDir)}/{fileName}";
    }

    // ─── Categories ──────────────────────────────────────────────────────
    public async Task<CategoryResponse> CreateCategoryAsync(CreateCategoryRequest request)
    {
        var existingCategory = await _context.Categories
            .FirstOrDefaultAsync(c => c.Name == request.Name);

        if (existingCategory is not null)
            throw new InvalidOperationException($"Category with name '{request.Name}' already exists.");

        var category = request.Adapt<Category>();
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return category.Adapt<CategoryResponse>();
    }

    public async Task<List<CategoryResponse>> GetCategoriesAsync()
    {
        var categories = await _context.Categories.ToListAsync();
        return categories.Select(c => c.Adapt<CategoryResponse>()).ToList();
    }

    public async Task<CategoryResponse> GetCategoryByIdAsync(int id)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new KeyNotFoundException($"Category with ID {id} not found.");

        return category.Adapt<CategoryResponse>();
    }

    public async Task<CategoryResponse> UpdateCategoryAsync(int id, UpdateCategoryRequest request)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new KeyNotFoundException($"Category with ID {id} not found.");

        if (request.Name is not null && request.Name != category.Name)
        {
            var existingCategory = await _context.Categories
                .FirstOrDefaultAsync(c => c.Name == request.Name && c.Id != id);

            if (existingCategory is not null)
                throw new InvalidOperationException($"Category with name '{request.Name}' already exists.");

            category.Name = request.Name;
        }

        if (request.Description is not null)
            category.Description = request.Description;

        _context.Categories.Update(category);
        await _context.SaveChangesAsync();

        return category.Adapt<CategoryResponse>();
    }

    public async Task DeleteCategoryAsync(int id)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new KeyNotFoundException($"Category with ID {id} not found.");

        // Check if category has books
        var hasBooks = await _context.Books.AnyAsync(b => b.CategoryId == id);
        if (hasBooks)
            throw new InvalidOperationException("Cannot delete category that has books assigned to it.");

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
    }

    // ─── Authors ─────────────────────────────────────────────────────────
    public async Task<AuthorResponse> CreateAuthorAsync(CreateAuthorRequest request)
    {
        var author = request.Adapt<Author>();
        _context.Authors.Add(author);
        await _context.SaveChangesAsync();

        return author.Adapt<AuthorResponse>();
    }

    public async Task<List<AuthorResponse>> GetAuthorsAsync()
    {
        var authors = await _context.Authors.ToListAsync();
        return authors.Select(a => a.Adapt<AuthorResponse>()).ToList();
    }

    public async Task<AuthorResponse> GetAuthorByIdAsync(int id)
    {
        var author = await _context.Authors
            .FirstOrDefaultAsync(a => a.Id == id)
            ?? throw new KeyNotFoundException($"Author with ID {id} not found.");

        return author.Adapt<AuthorResponse>();
    }

    public async Task<AuthorResponse> UpdateAuthorAsync(int id, UpdateAuthorRequest request)
    {
        var author = await _context.Authors
            .FirstOrDefaultAsync(a => a.Id == id)
            ?? throw new KeyNotFoundException($"Author with ID {id} not found.");

        if (request.FirstName is not null) author.FirstName = request.FirstName;
        if (request.LastName is not null) author.LastName = request.LastName;
        if (request.Bio is not null) author.Bio = request.Bio;

        _context.Authors.Update(author);
        await _context.SaveChangesAsync();

        return author.Adapt<AuthorResponse>();
    }

    public async Task DeleteAuthorAsync(int id)
    {
        var author = await _context.Authors
            .FirstOrDefaultAsync(a => a.Id == id)
            ?? throw new KeyNotFoundException($"Author with ID {id} not found.");

        // Check if author has books
        var hasBooks = await _context.BookAuthors.AnyAsync(ba => ba.AuthorId == id);
        if (hasBooks)
            throw new InvalidOperationException("Cannot delete author that has books assigned.");

        _context.Authors.Remove(author);
        await _context.SaveChangesAsync();
    }

    // ─── Collections ─────────────────────────────────────────────────────
    public async Task<CollectionResponse> CreateCollectionAsync(CreateCollectionRequest request)
    {
        var existing = await _context.Collections
            .FirstOrDefaultAsync(c => c.Name == request.Name);

        if (existing is not null)
            throw new InvalidOperationException($"Collection '{request.Name}' already exists.");

        var collection = new Collection
        {
            Name = request.Name,
            Description = request.Description
        };

        _context.Collections.Add(collection);
        await _context.SaveChangesAsync();

        return new CollectionResponse(collection.Id, collection.Name, collection.Description);
    }

    public async Task<List<CollectionResponse>> GetCollectionsAsync()
    {
        var collections = await _context.Collections.ToListAsync();
        return collections
            .Select(c => new CollectionResponse(c.Id, c.Name, c.Description))
            .ToList();
    }

    public async Task<CollectionWithBooksResponse> GetCollectionByIdAsync(int id)
    {
        var collection = await _context.Collections
            .Include(c => c.Books.Where(b => b.IsActive).OrderBy(b => b.CollectionOrder))
                .ThenInclude(b => b.Category)
            .Include(c => c.Books)
                .ThenInclude(b => b.BookAuthors)
                    .ThenInclude(ba => ba.Author)
            .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new KeyNotFoundException($"Collection with ID {id} not found.");

        var books = collection.Books
            .Where(b => b.IsActive)
            .OrderBy(b => b.CollectionOrder)
            .Select(MapBookToResponse)
            .ToList();

        return new CollectionWithBooksResponse(collection.Id, collection.Name, collection.Description, books);
    }

    public async Task<CollectionResponse> UpdateCollectionAsync(int id, UpdateCollectionRequest request)
    {
        var collection = await _context.Collections
            .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new KeyNotFoundException($"Collection with ID {id} not found.");

        if (request.Name is not null && request.Name != collection.Name)
        {
            var existing = await _context.Collections
                .FirstOrDefaultAsync(c => c.Name == request.Name && c.Id != id);

            if (existing is not null)
                throw new InvalidOperationException($"Collection '{request.Name}' already exists.");

            collection.Name = request.Name;
        }

        if (request.Description is not null)
            collection.Description = request.Description;

        _context.Collections.Update(collection);
        await _context.SaveChangesAsync();

        return new CollectionResponse(collection.Id, collection.Name, collection.Description);
    }

    public async Task DeleteCollectionAsync(int id)
    {
        var collection = await _context.Collections
            .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new KeyNotFoundException($"Collection with ID {id} not found.");

        // Detach books from collection instead of blocking delete
        var books = await _context.Books.Where(b => b.CollectionId == id).ToListAsync();
        foreach (var book in books)
        {
            book.CollectionId = null;
            book.CollectionOrder = null;
        }

        _context.Collections.Remove(collection);
        await _context.SaveChangesAsync();
    }


    public async Task<int> GetStockAsync(int id)
{
    var book = await _context.Books.FirstOrDefaultAsync(b => b.Id == id && b.IsActive)
        ?? throw new KeyNotFoundException($"Book with ID {id} not found.");
    return book.StockQuantity;
}

public async Task ReduceStockAsync(int id, int quantity)
{
    var book = await _context.Books.FirstOrDefaultAsync(b => b.Id == id && b.IsActive)
        ?? throw new KeyNotFoundException($"Book with ID {id} not found.");

    if (book.StockQuantity < quantity)
        throw new InvalidOperationException("Not enough stock.");

    book.StockQuantity -= quantity;
    
    if (book.StockQuantity == 0)
        book.IsAvailable = false;

    await _context.SaveChangesAsync();
}
    // ─── Helper ──────────────────────────────────────────────────────────
    private BookResponse MapBookToResponse(Book book)
    {
        var authors = book.BookAuthors
            .Select(ba => new AuthorResponse(ba.Author.Id, ba.Author.FirstName, ba.Author.LastName, ba.Author.Bio))
            .ToList();

        CollectionResponse? collectionResponse = book.Collection is not null
            ? new CollectionResponse(book.Collection.Id, book.Collection.Name, book.Collection.Description)
            : null;

        return new BookResponse(
            book.Id,
            book.Title,
            book.Description,
            book.ISBN,
            book.Price,
            book.DiscountPrice,
            book.PublishedYear,
            book.Language,
            book.Publisher,
            book.PageCount,
            book.PaperColor,
            book.Height,
            book.Width,
            book.Depth,
            book.FrontImagePath,
            book.BackImagePath,
            book.SpineImagePath,
            book.IsAvailable,
            book.CategoryId,
            book.Category?.Adapt<CategoryResponse>(),
            authors,
            collectionResponse,
            book.CollectionOrder,
            book.CreatedAt,
            book.StockQuantity
        );
    }
}

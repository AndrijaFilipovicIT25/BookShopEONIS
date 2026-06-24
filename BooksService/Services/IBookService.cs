using BooksService.DTOs;

namespace BooksService.Services;

public interface IBookService
{
    // Books
    Task<BookResponse> GetBookByIdAsync(int id);
    Task<List<BookResponse>> GetBooksAsync(int pageNumber = 1, int pageSize = 10);
    Task<BookResponse> CreateBookAsync(CreateBookRequest request);
    Task<BookResponse> UpdateBookAsync(int id, UpdateBookRequest request);
    Task DeleteBookAsync(int id);
    Task<int> GetStockAsync(int id);
Task ReduceStockAsync(int id, int quantity);

    // Upload images
    Task<string> UploadSingleImageAsync(int bookId, IFormFile image, string imageType);

    // Categories
    Task<CategoryResponse> CreateCategoryAsync(CreateCategoryRequest request);
    Task<List<CategoryResponse>> GetCategoriesAsync();
    Task<CategoryResponse> GetCategoryByIdAsync(int id);
    Task<CategoryResponse> UpdateCategoryAsync(int id, UpdateCategoryRequest request);
    Task DeleteCategoryAsync(int id);

    // Authors
    Task<AuthorResponse> CreateAuthorAsync(CreateAuthorRequest request);
    Task<List<AuthorResponse>> GetAuthorsAsync();
    Task<AuthorResponse> GetAuthorByIdAsync(int id);
    Task<AuthorResponse> UpdateAuthorAsync(int id, UpdateAuthorRequest request);
    Task DeleteAuthorAsync(int id);

    // Collections
    Task<CollectionResponse> CreateCollectionAsync(CreateCollectionRequest request);
    Task<List<CollectionResponse>> GetCollectionsAsync();
    Task<CollectionWithBooksResponse> GetCollectionByIdAsync(int id);
    Task<CollectionResponse> UpdateCollectionAsync(int id, UpdateCollectionRequest request);
    Task DeleteCollectionAsync(int id);
}

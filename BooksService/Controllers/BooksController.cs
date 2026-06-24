using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BooksService.DTOs;
using BooksService.Services;

namespace BooksService.Controllers;

[ApiController]
[Route("api/books")]
public class BooksController : ControllerBase
{
    private readonly IBookService _bookService;

    public BooksController(IBookService bookService)
    {
        _bookService = bookService;
    }

    // ─── Books ────────────────────────────────────────────────────────────
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBook(int id)
    {
        var book = await _bookService.GetBookByIdAsync(id);
        return Ok(book);
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetBooks([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var books = await _bookService.GetBooksAsync(pageNumber, pageSize);
        return Ok(books);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateBook([FromBody] CreateBookRequest request)
    {
        var book = await _bookService.CreateBookAsync(request);
        return CreatedAtAction(nameof(GetBook), new { id = book.Id }, book);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateBook(int id, [FromBody] UpdateBookRequest request)
    {
        var book = await _bookService.UpdateBookAsync(id, request);
        return Ok(book);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteBook(int id)
    {
        await _bookService.DeleteBookAsync(id);
        return NoContent();
    }

    // GET /api/books/{id}/stock
[HttpGet("{id}/stock")]
[AllowAnonymous]
public async Task<IActionResult> GetStock(int id)
{
    var stock = await _bookService.GetStockAsync(id);
    return Ok(new { bookId = id, stockQuantity = stock });
}

// PUT /api/books/{id}/reduce-stock
[HttpPut("{id}/reduce-stock")]
[AllowAnonymous]
public async Task<IActionResult> ReduceStock(int id, [FromBody] ReduceStockRequest request)
{
    await _bookService.ReduceStockAsync(id, request.Quantity);
    return Ok();
}

    // ─── Book Images ──────────────────────────────────────────────────────
    [HttpPost("{id}/upload-front-image")]
    [Authorize(Roles = "Admin")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadFrontImage(int id, [FromForm] IFormFile image)
    {
        if (image is null || image.Length == 0)
            return BadRequest("Image file is required.");

        var result = await _bookService.UploadSingleImageAsync(id, image, "front");
        return Ok(new { frontImagePath = result });
    }

    [HttpPost("{id}/upload-back-image")]
    [Authorize(Roles = "Admin")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadBackImage(int id, [FromForm] IFormFile image)
    {
        if (image is null || image.Length == 0)
            return BadRequest("Image file is required.");

        var result = await _bookService.UploadSingleImageAsync(id, image, "back");
        return Ok(new { backImagePath = result });
    }

    [HttpPost("{id}/upload-spine-image")]
    [Authorize(Roles = "Admin")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadSpineImage(int id, [FromForm] IFormFile image)
    {
        if (image is null || image.Length == 0)
            return BadRequest("Image file is required.");

        var result = await _bookService.UploadSingleImageAsync(id, image, "spine");
        return Ok(new { spineImagePath = result });
    }

    // ─── Categories ───────────────────────────────────────────────────────
    [HttpGet("categories")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _bookService.GetCategoriesAsync();
        return Ok(categories);
    }

    [HttpGet("categories/{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCategory(int id)
    {
        var category = await _bookService.GetCategoryByIdAsync(id);
        return Ok(category);
    }

    [HttpPost("categories")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryRequest request)
    {
        var category = await _bookService.CreateCategoryAsync(request);
        return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
    }

    [HttpPut("categories/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] UpdateCategoryRequest request)
    {
        var category = await _bookService.UpdateCategoryAsync(id, request);
        return Ok(category);
    }

    [HttpDelete("categories/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        await _bookService.DeleteCategoryAsync(id);
        return NoContent();
    }

    // ─── Authors ──────────────────────────────────────────────────────────
    [HttpGet("authors")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAuthors()
    {
        var authors = await _bookService.GetAuthorsAsync();
        return Ok(authors);
    }

    [HttpGet("authors/{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAuthor(int id)
    {
        var author = await _bookService.GetAuthorByIdAsync(id);
        return Ok(author);
    }

    [HttpPost("authors")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateAuthor([FromBody] CreateAuthorRequest request)
    {
        var author = await _bookService.CreateAuthorAsync(request);
        return CreatedAtAction(nameof(GetAuthor), new { id = author.Id }, author);
    }

    [HttpPut("authors/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateAuthor(int id, [FromBody] UpdateAuthorRequest request)
    {
        var author = await _bookService.UpdateAuthorAsync(id, request);
        return Ok(author);
    }

    [HttpDelete("authors/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteAuthor(int id)
    {
        await _bookService.DeleteAuthorAsync(id);
        return NoContent();
    }

    // ─── Collections ──────────────────────────────────────────────────────
    [HttpGet("collections")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCollections()
    {
        var collections = await _bookService.GetCollectionsAsync();
        return Ok(collections);
    }

    [HttpGet("collections/{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCollection(int id)
    {
        var collection = await _bookService.GetCollectionByIdAsync(id);
        return Ok(collection);
    }

    [HttpPost("collections")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateCollection([FromBody] CreateCollectionRequest request)
    {
        var collection = await _bookService.CreateCollectionAsync(request);
        return CreatedAtAction(nameof(GetCollection), new { id = collection.Id }, collection);
    }

    [HttpPut("collections/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateCollection(int id, [FromBody] UpdateCollectionRequest request)
    {
        var collection = await _bookService.UpdateCollectionAsync(id, request);
        return Ok(collection);
    }

    [HttpDelete("collections/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteCollection(int id)
    {
        await _bookService.DeleteCollectionAsync(id);
        return NoContent();
    }
}
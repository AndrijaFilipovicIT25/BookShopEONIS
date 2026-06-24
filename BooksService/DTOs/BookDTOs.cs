namespace BooksService.DTOs;

// ─── Collection DTOs ──────────────────────────────────────────────────────
public record CreateCollectionRequest(
    string Name,
    string? Description
);

public record UpdateCollectionRequest(
    string? Name,
    string? Description
);

public record CollectionResponse(
    int Id,
    string Name,
    string? Description
);

public record CollectionWithBooksResponse(
    int Id,
    string Name,
    string? Description,
    List<BookResponse> Books
);
public record ReduceStockRequest(int Quantity);
// ─── Book DTOs ─────────────────────────────────────────────────────────────
public record CreateBookRequest(
    string Title,
    string? Description,
    string ISBN,
    decimal Price,
    decimal? DiscountPrice,
    int? PublishedYear,
    string? Language,
    string? Publisher,
    int? PageCount,
    string? PaperColor,
    decimal? Height,
    decimal? Width,
    decimal? Depth,
    int CategoryId,
    List<int>? AuthorIds,
    int? CollectionId,
    int? CollectionOrder,
    int StockQuantity =0
);

public record UpdateBookRequest(
    string? Title,
    string? Description,
    decimal? Price,
    decimal? DiscountPrice,
    int? PublishedYear,
    string? Language,
    string? Publisher,
    int? PageCount,
    string? PaperColor,
    decimal? Height,
    decimal? Width,
    decimal? Depth,
    int? CategoryId,
    bool? IsAvailable,
    List<int>? AuthorIds,
    int? CollectionId,
    int? CollectionOrder,int StockQuantity
);

public record BookResponse(
    int Id,
    string Title,
    string? Description,
    string ISBN,
    decimal Price,
    decimal? DiscountPrice,
    int? PublishedYear,
    string? Language,
    string? Publisher,
    int? PageCount,
    string? PaperColor,
    decimal? Height,
    decimal? Width,
    decimal? Depth,
    string? FrontImagePath,
    string? BackImagePath,
    string? SpineImagePath,
    bool IsAvailable,
    int CategoryId,
    CategoryResponse? Category,
    List<AuthorResponse>? Authors,
    CollectionResponse? Collection,
    int? CollectionOrder,
    DateTime CreatedAt,
    int StockQuantity
);

public record CreateBookResponsePayload(
    int Id,
    string FrontImagePath,
    string BackImagePath,
    string SpineImagePath
);

// ─── Category DTOs ────────────────────────────────────────────────────────
public record CreateCategoryRequest(
    string Name,
    string? Description
);

public record UpdateCategoryRequest(
    string? Name,
    string? Description
);

public record CategoryResponse(
    int Id,
    string Name,
    string? Description
);

// ─── Author DTOs ──────────────────────────────────────────────────────────
public record CreateAuthorRequest(
    string FirstName,
    string LastName,
    string? Bio
);

public record UpdateAuthorRequest(
    string? FirstName,
    string? LastName,
    string? Bio
);

public record AuthorResponse(
    int Id,
    string FirstName,
    string LastName,
    string? Bio
);

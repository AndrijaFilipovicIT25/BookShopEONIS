# BooksService API

A complete .NET 8 web API for managing books, categories, and authors in a bookshop system. Built with Entity Framework Core, FluentValidation, and Mapster.

## Features

- **Book Management**: Create, read, update, delete books with full details (dimensions, pricing, availability)
- **Image Upload**: Upload front, back, and spine cover images for books (local storage with wwwroot)
- **Category Management**: Organize books by categories
- **Author Management**: Manage authors with many-to-many relationship to books
- **FluentValidation**: Comprehensive request validation
- **Mapster**: Efficient entity-to-DTO mapping
- **Exception Handling**: Global exception handling middleware
- **Swagger/OpenAPI**: Full API documentation

## Database Schema

- **Books** schema containing:
  - `Book` - Book entity with images and dimensions
  - `Category` - Book categories (one-to-many relationship)
  - `Author` - Book authors
  - `BookAuthor` - Explicit join table for many-to-many relationship

## Setup & Running

### Prerequisites
- .NET 8 SDK
- SQL Server (or SQL Server Express)

### Installation

1. **Clone/Extract the project**
   ```bash
   cd BooksService
   ```

2. **Update Connection String**
   Edit `appsettings.json` and update the `DefaultConnection`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=YOUR_SERVER;Database=BookshopDb;Trusted_Connection=true;TrustServerCertificate=true;"
   }
   ```

3. **Restore Dependencies**
   ```bash
   dotnet restore
   ```

4. **Create Database & Run Migrations**
   ```bash
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

5. **Run the Application**
   ```bash
   dotnet run
   ```

The API will be available at `https://localhost:5001` (HTTPS) or `http://localhost:5000` (HTTP).

Swagger UI: `http://localhost:5000/swagger`

## API Endpoints

### Books
- `GET /api/books` - Get all books (paginated)
- `GET /api/books/{id}` - Get book by ID
- `POST /api/books` - Create new book
- `PUT /api/books/{id}` - Update book
- `DELETE /api/books/{id}` - Soft delete book
- `POST /api/books/{id}/upload-images` - Upload book images

### Categories
- `GET /api/books/categories` - Get all categories
- `GET /api/books/categories/{id}` - Get category by ID
- `POST /api/books/categories` - Create category
- `PUT /api/books/categories/{id}` - Update category
- `DELETE /api/books/categories/{id}` - Delete category

### Authors
- `GET /api/books/authors` - Get all authors
- `GET /api/books/authors/{id}` - Get author by ID
- `POST /api/books/authors` - Create author
- `PUT /api/books/authors/{id}` - Update author
- `DELETE /api/books/authors/{id}` - Delete author

## Image Upload Example

```bash
curl -X POST \
  -F "frontImage=@front.jpg" \
  -F "backImage=@back.jpg" \
  -F "spineImage=@spine.jpg" \
  http://localhost:5000/api/books/1/upload-images
```

Images are stored in `wwwroot/uploads/books/{bookId}/`

## Project Structure

```
BooksService/
├── Models/           # Domain entities
├── Data/             # DbContext and database configuration
├── DTOs/             # Request/Response DTOs and validators
├── Services/         # Business logic and interfaces
├── Controllers/      # HTTP endpoints
├── Middleware/       # Custom middleware
├── Program.cs        # Application startup configuration
└── appsettings.json  # Configuration
```

## Notes

- Books use **soft delete** (IsActive flag) - deleted books are marked inactive, not removed from DB
- **Images are stored locally** in `wwwroot/uploads/` - designed for easy migration to cloud storage (Azure Blob, S3)
- **ISBN is unique** per book
- **Authors have many-to-many relationship** with books via explicit `BookAuthor` join table
- **Categories** use one-to-many relationship with books

## Technologies Used

- **Framework**: ASP.NET Core 8
- **ORM**: Entity Framework Core 8
- **Validation**: FluentValidation
- **Mapping**: Mapster
- **Documentation**: Swagger/OpenAPI

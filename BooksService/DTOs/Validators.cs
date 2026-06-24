using FluentValidation;

namespace BooksService.DTOs;

public class CreateBookRequestValidator : AbstractValidator<CreateBookRequest>
{
    public CreateBookRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(255).WithMessage("Title cannot exceed 255 characters.");

        RuleFor(x => x.ISBN)
            .NotEmpty().WithMessage("ISBN is required.")
            .MaximumLength(20).WithMessage("ISBN cannot exceed 20 characters.")
            .Matches(@"^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[X0-9]$")
            .WithMessage("ISBN format is invalid.");

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Price must be greater than 0.");

        RuleFor(x => x.DiscountPrice)
            .GreaterThan(0).When(x => x.DiscountPrice.HasValue)
            .WithMessage("Discount price must be greater than 0.")
            .LessThan(x => x.Price).When(x => x.DiscountPrice.HasValue)
            .WithMessage("Discount price must be less than regular price.");

        RuleFor(x => x.Height)
            .GreaterThan(0).When(x => x.Height.HasValue)
            .WithMessage("Height must be greater than 0.");

        RuleFor(x => x.Width)
            .GreaterThan(0).When(x => x.Width.HasValue)
            .WithMessage("Width must be greater than 0.");

        RuleFor(x => x.Depth)
            .GreaterThan(0).When(x => x.Depth.HasValue)
            .WithMessage("Depth must be greater than 0.");

        RuleFor(x => x.Language)
            .MaximumLength(50).When(x => x.Language is not null)
            .WithMessage("Language cannot exceed 50 characters.");

        RuleFor(x => x.Publisher)
            .MaximumLength(255).When(x => x.Publisher is not null)
            .WithMessage("Publisher cannot exceed 255 characters.");

        RuleFor(x => x.PageCount)
            .GreaterThan(0).When(x => x.PageCount.HasValue)
            .WithMessage("Page count must be greater than 0.");

        RuleFor(x => x.CategoryId)
            .GreaterThan(0).WithMessage("Category ID must be valid.");

        RuleFor(x => x.AuthorIds)
            .NotEmpty().WithMessage("At least one author is required.")
            .Must(ids => ids != null && ids.All(id => id > 0))
            .WithMessage("All author IDs must be valid.");
    }
}

public class UpdateBookRequestValidator : AbstractValidator<UpdateBookRequest>
{
    public UpdateBookRequestValidator()
    {
        RuleFor(x => x.Title)
            .MaximumLength(255).When(x => x.Title is not null)
            .WithMessage("Title cannot exceed 255 characters.");

        RuleFor(x => x.Price)
            .GreaterThan(0).When(x => x.Price.HasValue)
            .WithMessage("Price must be greater than 0.");

        RuleFor(x => x.DiscountPrice)
            .GreaterThan(0).When(x => x.DiscountPrice.HasValue)
            .WithMessage("Discount price must be greater than 0.");

        RuleFor(x => x.Height)
            .GreaterThan(0).When(x => x.Height.HasValue)
            .WithMessage("Height must be greater than 0.");

        RuleFor(x => x.Width)
            .GreaterThan(0).When(x => x.Width.HasValue)
            .WithMessage("Width must be greater than 0.");

        RuleFor(x => x.Depth)
            .GreaterThan(0).When(x => x.Depth.HasValue)
            .WithMessage("Depth must be greater than 0.");

        RuleFor(x => x.PageCount)
            .GreaterThan(0).When(x => x.PageCount.HasValue)
            .WithMessage("Page count must be greater than 0.");
    }
}

public class CreateCategoryRequestValidator : AbstractValidator<CreateCategoryRequest>
{
    public CreateCategoryRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Category name is required.")
            .MaximumLength(100).WithMessage("Category name cannot exceed 100 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(500).When(x => x.Description is not null)
            .WithMessage("Description cannot exceed 500 characters.");
    }
}

public class CreateAuthorRequestValidator : AbstractValidator<CreateAuthorRequest>
{
    public CreateAuthorRequestValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required.")
            .MaximumLength(100).WithMessage("First name cannot exceed 100 characters.");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required.")
            .MaximumLength(100).WithMessage("Last name cannot exceed 100 characters.");

        RuleFor(x => x.Bio)
            .MaximumLength(1000).When(x => x.Bio is not null)
            .WithMessage("Bio cannot exceed 1000 characters.");
    }
}

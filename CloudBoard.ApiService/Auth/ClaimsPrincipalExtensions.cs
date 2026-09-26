using System.Security.Claims;

namespace CloudBoard.ApiService.Auth;

public static class ClaimsPrincipalExtensions
{
    public static string? GetUserId(this ClaimsPrincipal user) =>
        user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? user.FindFirst("sub")?.Value;

    /// <summary>
    /// The user's email, lower-cased, but only if Keycloak marks it as verified. Board
    /// sharing is keyed on email, so an unverified address must never grant access.
    /// </summary>
    public static string? GetVerifiedEmail(this ClaimsPrincipal user)
    {
        var verified = user.FindFirst("email_verified")?.Value;
        if (!string.Equals(verified, "true", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        var email = user.FindFirst(ClaimTypes.Email)?.Value ?? user.FindFirst("email")?.Value;
        return string.IsNullOrWhiteSpace(email) ? null : NormalizeEmail(email);
    }

    public static string GetDisplayName(this ClaimsPrincipal user) =>
        user.FindFirst("name")?.Value
        ?? user.FindFirst("preferred_username")?.Value
        ?? user.FindFirst(ClaimTypes.Name)?.Value
        ?? "Unknown user";

    public static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();
}

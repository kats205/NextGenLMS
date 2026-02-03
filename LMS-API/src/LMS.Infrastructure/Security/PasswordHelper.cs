using BCrypt.Net;

namespace LMS.Infrastructure.Security;

public static class PasswordHelper
{
    // Hash m?t kh?u (dùng khi t?o user, seed data, reset password)
    public static string Hash(string plainPassword)
    {
        return BCrypt.Net.BCrypt.HashPassword(plainPassword);
    }

    // Verify khi login
    public static bool Verify(string hashedPassword, string inputPassword)
    {
        try
        {
            return BCrypt.Net.BCrypt.Verify(inputPassword, hashedPassword);
        }
        catch
        {
            return false;
        }
    }
}

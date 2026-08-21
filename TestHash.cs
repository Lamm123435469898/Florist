using System;
using BCrypt.Net;

class Program
{
    static void Main()
    {
        string hash = "$2a$11$N94M1/3aZg3O./qT9/p.Fef7zK2qH3jV3p3bW8x1tM3eD.T/f1w.e";
        string password = "password123";
        bool isMatch = BCrypt.Net.BCrypt.Verify(password, hash);
        Console.WriteLine($"Does it match? {isMatch}");
        
        // Generate a new one just in case
        string newHash = BCrypt.Net.BCrypt.HashPassword(password);
        Console.WriteLine($"New hash: {newHash}");
    }
}

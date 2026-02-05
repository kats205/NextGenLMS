using LMS.Domain.Common;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LMS.Domain.Entities.Users
{
    public class RefreshToken : BaseEntity
    {
        [Required]
        public string Token { get; set; } = string.Empty;

        public Guid UserId { get; set; }
        public AppUser? User { get; set; }

        public DateTime Expires { get; set; }
        public DateTime Created { get; set; } = DateTime.UtcNow;
        public DateTime? Revoked { get; set; }

        public bool IsExpired => DateTime.UtcNow >= Expires;
        public bool IsActive => Revoked == null && !IsExpired;
    }
}

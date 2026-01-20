using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Domain.Constant
{
    public static class UserRoles
    {
        // Role Names (dùng cho Authorization)
        public const string Admin = "Admin";
        public const string Student = "Student";
        public const string Lecturer = "Lecturer";

        // Role IDs (dùng cho database queries nếu cần)
        public static class Ids
        {
            public static readonly Guid Admin = Guid.Parse("11111111-1111-1111-1111-111111111111");
            public static readonly Guid Student = Guid.Parse("33333333-3333-3333-3333-333333333333");
            public static readonly Guid Lecturer = Guid.Parse("22222222-2222-2222-2222-222222222222");
        }
    }
}

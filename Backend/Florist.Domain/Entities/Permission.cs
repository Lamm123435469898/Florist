using System.Collections.Generic;
using Florist.Domain.Common;

namespace Florist.Domain.Entities
{
    public class Permission : BaseEntity
    {
        public string Name { get; set; } = string.Empty; // e.g. ""product.create""
        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }
}

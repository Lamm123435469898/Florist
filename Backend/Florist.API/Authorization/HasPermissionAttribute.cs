using Microsoft.AspNetCore.Authorization;
using System;

namespace Florist.API.Authorization
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, Inherited = false)]
    public class HasPermissionAttribute : AuthorizeAttribute
    {
        public const string PolicyPrefix = "HasPermission_";

        public HasPermissionAttribute(string permission)
        {
            Permission = permission;
            Policy = $"{PolicyPrefix}{permission}";
        }

        public string Permission { get; }
    }
}

export function userNavItems(userPermissions = []) {
    const allowedPermissions = userPermissions.map((perm) =>
        perm.toLowerCase()
    );

    return [
        {
            icon: "",
            label: "User setting",
            isParent: true,
            link: "",
            permission: "",
            permissions: [
                "user-settings-list",
            ],
        },

        {
            icon: "users",
            label: "User details",
            isParent: false,
            link: "tenant.user-settings.index",
            permission: "user-settings-list",
            permissions: [],
        },
    ].filter((item) => {
        if (item.isParent) {
            return item.permissions.every((perm) =>
                allowedPermissions.includes(perm)
            );
        } else {
            return allowedPermissions.includes(item.permission);
        }
    });
}

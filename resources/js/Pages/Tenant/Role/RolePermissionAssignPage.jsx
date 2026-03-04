import TenantSettingLayout from "@/Components/Tenant/TenantSettingLayout";
import { useTranslations } from "@/hooks/useTranslations";
import { swalToast } from "@/utils/toast";
import { router, useForm, usePage } from "@inertiajs/react";
import React, { useEffect, useMemo } from "react";
import { useRoute } from "ziggy";
import ButtonComponent from "@/Components/ButtonComponent";

export default function RolePermissionAssignPage() {
    const route = useRoute();
    const __ = useTranslations();
    const {
        tenant,
        routeNames,
        modulesWithPermissions,
        role,
        rolePermissions,
    } = usePage().props;

    // Extract existing permission IDs from rolePermissions
    const existingPermissionIds = useMemo(() => {
        if (rolePermissions && rolePermissions.permissions) {
            return rolePermissions.permissions.map(
                (permission) => permission.id
            );
        }
        return [];
    }, [rolePermissions]);

    const { data, setData, post, processing, errors, setError, clearErrors } =
        useForm({
            permissions: existingPermissionIds, // Initialize with existing permissions
            role: role,
        });

    // Ensure permissions is always an array
    const permissions = Array.isArray(data.permissions) ? data.permissions : [];
    const { toastAlert } = usePage().props;

    // Handle checkbox change
    const handlePermissionChange = (permissionId, isChecked) => {
        const currentPermissions = Array.isArray(data.permissions)
            ? data.permissions
            : [];

        if (isChecked) {
            // Add permission if checked and not already in array
            if (!currentPermissions.includes(permissionId)) {
                setData("permissions", [...currentPermissions, permissionId]);
            }
        } else {
            // Remove permission if unchecked
            setData(
                "permissions",
                currentPermissions.filter((id) => id !== permissionId)
            );
        }
    };


    const handlePermissionSubmit = (e) => {
        e.preventDefault();
        post(route(routeNames.permissionAssignStore, { tenant }), {
            preserveScroll: true,
            onSuccess: () => {
                console.log("Submitted successfully!");
                console.log("Submitted permissions:", data.permissions);
            },
            onError: (errors) => {
                console.log("Submission errors:", errors);
            },
        });
    };

    /** Toast effect: show only once per unique message */
    useEffect(() => {
        if (toastAlert && toastAlert.message) {
            swalToast({
                ...toastAlert,
                message: __([toastAlert.message]),
            });
        }
    }, [toastAlert]);

    return (
        <TenantSettingLayout>
            <div className="tab-pane block" id="general" role="tabpanel">
                <div className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-md">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">
                        Assign Permissions to Role:{" "}
                        {rolePermissions?.name || "Unknown Role"}
                    </h3>
                    <form
                        className="space-y-6"
                        onSubmit={handlePermissionSubmit}
                        noValidate
                    >
                        
                        {modulesWithPermissions?.length > 0 ? (
                            modulesWithPermissions.map((module, index) => (
                                <div
                                    key={module.id}
                                    className="mb-4 border rounded p-4"
                                >
                                    {/* Module title */}
                                    <h3 className="text-lg font-semibold mb-2">
                                        {module.name}
                                    </h3>

                                    {/* List of permissions with checkboxes */}
                                    <div className="grid grid-cols-2 gap-2">
                                        {module.permissions.map(
                                            (permission) => {
                                                const isChecked =
                                                    permissions.includes(
                                                        permission.id
                                                    );
                                                return (
                                                    <label
                                                        key={permission.id}
                                                        className="inline-flex items-center space-x-2"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            name="permissions[]"
                                                            value={
                                                                permission.id
                                                            }
                                                            checked={isChecked}
                                                            onChange={(e) =>
                                                                handlePermissionChange(
                                                                    permission.id,
                                                                    e.target
                                                                        .checked
                                                                )
                                                            }
                                                            className="form-checkbox permissions"
                                                        />
                                                        <span
                                                            className={
                                                                isChecked
                                                                    ? "text-blue-600 font-medium"
                                                                    : ""
                                                            }
                                                        >
                                                            {permission.name}
                                                        </span>
                                                    </label>
                                                );
                                            }
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500">
                                No permissions found.
                            </p>
                        )}

                        {/* Debug section - remove in production */}
                        <div className="bg-gray-100 p-3 rounded">
                            <p className="text-sm text-gray-600">
                                Selected permissions ({permissions.length}):{" "}
                                {permissions.join(", ")}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                Previously assigned (
                                {existingPermissionIds.length}):{" "}
                                {existingPermissionIds.join(", ")}
                            </p>
                        </div>

                        <div>
                            <ButtonComponent
                                type="submit"
                                icon="add"
                                text="Update Permissions"
                                loading={processing}
                                className="btn btn-sm btn-accent"
                                iconClass="base-100 h-4 w-4"
                            />
                        </div>
                    </form>
                </div>
            </div>
        </TenantSettingLayout>
    );
}

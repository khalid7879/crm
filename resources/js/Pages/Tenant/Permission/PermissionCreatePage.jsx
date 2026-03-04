import React, { useEffect, useMemo } from "react";
import TenantSettingLayout from "@/Components/Tenant/TenantSettingLayout";
import Breadcrumb from "@/Components/Tenant/PageComponent/BreadcrumbComponent";
import TableCardComponent from "@/Components/Tenant/PageComponent/TableCardComponent";
import ResetFormButtonComponent from "@/Components/Tenant/Buttons/ResetFormButtonComponent";
import { useTranslations } from "@/hooks/useTranslations";
import CommonFormInputComponent from "@/Components/Tenant/Forms/CommonFormInputComponent";
import { TenantPermissionSchema } from "@/schemas/tenants/tenantPermissionSchema";
import { TenantPermissionCreateInputs } from "@/utils/forms/permissionInputs";
import { PermissionListNavItems } from "@/utils/common/BreadcrumbNavItems";
import { swalToast } from "@/utils/toast";
import { router, useForm, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";
import ButtonComponent from "@/Components/ButtonComponent";

export default function PermissionCreatePage() {
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Permissions");
    const { tenant, routeNames, modules } = usePage().props;
    const { data, setData, post, processing, errors, setError, clearErrors } =
        useForm({
            name: "",
            module: "",
        });
    const { toastAlert } = usePage().props;
    const permissionInputs = useMemo(() => {
        return TenantPermissionCreateInputs.map((field) => {
            if (field.name === "module") {
                return {
                    ...field,
                    options: [
                        {
                            optValue: "",
                            optLabel: "Select Module",
                            isDisabled: false,
                        },
                        ...modules.map((module) => ({
                            optValue: module.id,
                            optLabel: module.name,
                            isDisabled: false,
                        })),
                    ],
                };
            }
            return field;
        });
    }, [modules]);

    const schema = useMemo(() => TenantPermissionSchema(__), []);

    const handlePermissionSubmit = (e) => {
        e.preventDefault();
        clearErrors();

        const { error } = schema.validate(
            {
                name: data.name,
                module: data.module,
            },
            { abortEarly: false }
        );

        if (error) {
            const joiErrors = {};
            error.details.forEach((detail) => {
                const field = detail.path[0];
                joiErrors[field] = detail.message;
            });

            clearErrors();
            setError(joiErrors);
            return;
        }

        clearErrors();

        post(route(routeNames.permissionsStore, { tenant }), data, {
            preserveScroll: true,
            onSuccess: () => {
                console.log("Submitted!");
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
            if (toastAlert.type == "success") {
                setData({
                    name: "",
                    module: "",
                });
            }
        }
        router.reload({ only: [] });
    }, [toastAlert]);
    const resetData = (formId = "") => {
        setData({ name: "", module: "" });
    };

    return (
        <TenantSettingLayout metaTitle={metaTitle}>
            <Breadcrumb
                title={metaTitle}
                btnIcon="list"
                navItems={[...PermissionListNavItems, { name: "Create" }]}
                link="tenant.permissions.index"
            ></Breadcrumb>
            <TableCardComponent>
                <form
                    className="space-y-6"
                    onSubmit={handlePermissionSubmit}
                    noValidate
                >
                    {/* Single Input Field */}
                    {permissionInputs.map((field) => (
                        <CommonFormInputComponent
                            key={field.name}
                            field={field}
                            data={data}
                            errors={errors}
                            setData={setData}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    ))}

                    {/* Submit Button */}
                    <div className="buttons flex justify-between">
                        <div>
                            <ButtonComponent
                                type="submit"
                                icon="add"
                                text="Submit"
                                loading={processing}
                                className="btn btn-sm btn-accent flex items-center"
                                iconClass="base-100 h-4 w-4"
                            />
                        </div>
                        <ResetFormButtonComponent method={resetData} />
                    </div>
                </form>
            </TableCardComponent>
        </TenantSettingLayout>
    );
}

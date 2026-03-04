import TenantSettingLayout from "@/Components/Tenant/TenantSettingLayout";
import { useTranslations } from "@/hooks/useTranslations";
import CommonFormInputComponent from "@/Components/Tenant/Forms/CommonFormInputComponent";
import Breadcrumb from "@/Components/Tenant/PageComponent/BreadcrumbComponent";
import TableCardComponent from "@/Components/Tenant/PageComponent/TableCardComponent";
import ResetFormButtonComponent from "@/Components/Tenant/Buttons/ResetFormButtonComponent";
import { TenantRoleSchema } from "@/schemas/tenants/tenantRoleSchema";
import { TenantRoleCreateInputs } from "@/utils/forms/roleInputs";
import { RoleListNavItems } from "@/utils/common/BreadcrumbNavItems";
import { swalToast } from "@/utils/toast";
import ButtonComponent from "@/Components/ButtonComponent";
import { router, useForm, usePage } from "@inertiajs/react";
import Select from "react-select";
import React, { useEffect, useMemo, useState } from "react";
import { useRoute } from "ziggy";

export default function RoleCreatePage() {
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Roles");
    const { tenant, routeNames } = usePage().props;

    const { data, setData, post, processing, errors, setError, clearErrors } =
        useForm({
            name: "",
        });
    const { toastAlert } = usePage().props;

    const schema = useMemo(() => TenantRoleSchema(__), []);

    const handleModelSubmit = (e) => {
        e.preventDefault();
        clearErrors();
        const { error } = schema.validate(
            {
                name: data.name,
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
        post(route(routeNames.rolesStore, { tenant }), data, {
            preserveScroll: true,
            onSuccess: () => {
                console.log("Submitted!");
            },
        });
    };
    const resetData = (formId = "") => {
        setData({ name: "" });
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
                });
            }
        }
        router.reload({ only: [] });
    }, [toastAlert]);

    return (
        <TenantSettingLayout metaTitle={metaTitle}>
            <Breadcrumb
                title={metaTitle}
                btnIcon="list"
                navItems={[...RoleListNavItems, { name: "Create" }]}
                link="tenant.roles.index"
            ></Breadcrumb>
            <TableCardComponent>
                <form
                    id=""
                    className="space-y-6"
                    onSubmit={handleModelSubmit}
                    noValidate
                >
                    {/* Single Input Field */}
                    {TenantRoleCreateInputs.map((field) => (
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

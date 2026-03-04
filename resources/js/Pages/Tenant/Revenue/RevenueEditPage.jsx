import TenantSettingLayout from "@/Components/Tenant/TenantSettingLayout";
import Breadcrumb from "@/Components/Tenant/PageComponent/BreadcrumbComponent";
import TableCardComponent from "@/Components/Tenant/PageComponent/TableCardComponent";
import ResetFormButtonComponent from "@/Components/Tenant/Buttons/ResetFormButtonComponent";
import { useTranslations } from "@/hooks/useTranslations";
import UserFormInputComponent from "@/Components/Tenant/Forms/UserFormInputComponent";
import { TenantRevenueSchema } from "@/schemas/tenants/tenantRevenueSchema";
import { TenantRevenueCreateInputs } from "@/utils/forms/revenueInputs";
import { DataRevenueListNavItems } from "@/utils/common/BreadcrumbNavItems";
import { swalToast } from "@/utils/toast";
import { router, useForm, usePage } from "@inertiajs/react";
import React, { useEffect, useMemo } from "react";
import { useRoute } from "ziggy";
import ButtonComponent from "@/Components/ButtonComponent";

export default function RevenueEditPage() {
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Revenue type");
    const { tenant, routeNames, revenue } = usePage().props;
    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        setError,
        clearErrors,
    } = useForm({
        name: revenue?.name || "",
    });
    const { toastAlert } = usePage().props;

    const schema = useMemo(() => TenantRevenueSchema(__), []);

    const handleModelUpdate = (e) => {
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

        put(
            route(routeNames.dataRevenueUpdate, {
                tenant,
                data_revenue: revenue.id,
            }),
            data,
            {
                preserveScroll: true,
                onSuccess: (response) => {
                    // Handle success
                    console.log("Module updated successfully");
                },
                onError: (errors) => {
                    // Handle errors
                    console.error("Update failed:", errors);
                },
            }
        );
    };

    /** Toast effect: show only once per unique message */
    useEffect(() => {
        if (toastAlert && toastAlert.message) {
            swalToast({
                ...toastAlert,
                message: __([toastAlert.message]),
            });
        }
        router.reload({ only: [] });
    }, [toastAlert]);

    const navItems = [
        {
            name: "System setting",
            link: "tenant.setting",
        },
        {
            name: "Revenue edit",
            link: "#",
        },
    ];
    const resetData = (formId) => {
        setData({ name: "" });
    };

    return (
        <TenantSettingLayout metaTitle={metaTitle}>
            <Breadcrumb
                title={metaTitle}
                navItems={[...DataRevenueListNavItems, { name: "Edit" }]}
                btnIcon="list"
                link="tenant.data-revenue.index"
            ></Breadcrumb>
            <TableCardComponent>
                <form
                    className="space-y-6"
                    onSubmit={handleModelUpdate}
                    noValidate
                >
                    {/* Single Input Field */}
                    {TenantRevenueCreateInputs.map((field) => (
                        <UserFormInputComponent
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
                                text="Update"
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

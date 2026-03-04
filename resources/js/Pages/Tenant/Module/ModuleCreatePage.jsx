import React, { useEffect, useMemo } from "react";
import { router, useForm, usePage } from "@inertiajs/react";
import TenantSettingLayout from "@/Components/Tenant/TenantSettingLayout";
import { useTranslations } from "@/hooks/useTranslations";
import UserFormInputComponent from "@/Components/Tenant/Forms/UserFormInputComponent";
import Breadcrumb from "@/Components/Tenant/PageComponent/BreadcrumbComponent";
import TableCardComponent from "@/Components/Tenant/PageComponent/TableCardComponent";
import ResetFormButtonComponent from "@/Components/Tenant/Buttons/ResetFormButtonComponent";
import { TenantModuleSchema } from "@/schemas/tenants/tenantModuleSchema";
import { TenantModuleCreateInputs } from "@/utils/forms/moduleInputs";
import { ModuleListNavItems } from "@/utils/common/BreadcrumbNavItems";
import { swalToast } from "@/utils/toast";
import { useRoute } from "ziggy";
import ButtonComponent from "@/Components/ButtonComponent";

export default function ModuleCreatePage() {
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Modules");
    const { tenant, routeNames } = usePage().props;
    const { data, setData, post, processing, errors, setError, clearErrors } =
        useForm({
            name: "",
            note: "",
        });
    const { toastAlert } = usePage().props;

    const schema = useMemo(() => TenantModuleSchema(__), []);

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

        post(route(routeNames.modulesStore, { tenant }), data, {
            preserveScroll: true,
            onSuccess: () => {},
        });
    };

    const resetData = (formId) => {
        setData({ name: "", note: "" });
    };

    /** Toast effect: show only once per unique message */
    useEffect(() => {
        if (toastAlert && toastAlert?.message) {
            swalToast({
                ...toastAlert,
                message: __([toastAlert.message]),
            });
            if (toastAlert.type == "success") {
                setData({
                    name: "",
                    note: "",
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
                navItems={[...ModuleListNavItems, { name: "Create" }]}
                link="tenant.modules.index"
            ></Breadcrumb>
            <TableCardComponent>
                <form
                    id="moduleCreate"
                    className="space-y-6"
                    onSubmit={handleModelSubmit}
                    noValidate
                >
                    {/* Single Input Field */}
                    {TenantModuleCreateInputs.map((field) => (
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

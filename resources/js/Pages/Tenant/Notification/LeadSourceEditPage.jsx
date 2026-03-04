import React, { useEffect, useMemo } from "react";
import TenantSettingLayout from "@/Components/Tenant/TenantSettingLayout";
import { useTranslations } from "@/hooks/useTranslations";
import CommonFormInputComponent from "@/Components/Tenant/Forms/CommonFormInputComponent";
import ResetFormButtonComponent from "@/Components/Tenant/Buttons/ResetFormButtonComponent";
import Breadcrumb from "@/Components/Tenant/PageComponent/BreadcrumbComponent";
import TableCardComponent from "@/Components/Tenant/PageComponent/TableCardComponent";
import { TenantLeadSourceSchema } from "@/schemas/tenants/tenantLeadSourceSchema";
import { TenantLeadSourceCreateInputs } from "@/utils/forms/leadSourceInputs";
import { LeadSourceListNavItems } from "@/utils/common/BreadcrumbNavItems";
import { swalToast } from "@/utils/toast";
import { useForm, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";
import ButtonComponent from "@/Components/ButtonComponent";

export default function LeadSourceEditPage() {
    const route = useRoute();
    const __ = useTranslations();
    const { tenant, routeNames, leadSources } = usePage().props;
    const metaTitle = __("Source");
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
        name: leadSources?.name || "",
    });
    const { toastAlert } = usePage().props;

    const schema = useMemo(() => TenantLeadSourceSchema(__), []);

    const handleLeadSourceUpdate = (e) => {
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
            route(routeNames.leadSourcesUpdate, {
                tenant,
                lead_source: leadSources.id,
            }),
            data,
            {
                preserveScroll: true,
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
    }, [toastAlert]);
    const resetData = (formId="") => {
        setData({ name: "" });
    };

    return (
        <TenantSettingLayout metaTitle={metaTitle}>
            <Breadcrumb
                title={metaTitle}
                navItems={[LeadSourceListNavItems, { name: "Edit" }]}
                btnIcon="list"
                link="tenant.lead-sources.index"
            ></Breadcrumb>
            <TableCardComponent>
                <form
                    className="space-y-6"
                    onSubmit={handleLeadSourceUpdate}
                    noValidate
                >
                    {/* Single Input Field */}
                    {TenantLeadSourceCreateInputs.map((field) => (
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

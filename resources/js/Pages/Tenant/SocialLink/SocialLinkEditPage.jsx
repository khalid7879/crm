import React, { useEffect, useMemo } from "react";
import TenantSettingLayout from "@/Components/Tenant/TenantSettingLayout";
import { useTranslations } from "@/hooks/useTranslations";
import CommonFormInputComponent from "@/Components/Tenant/Forms/CommonFormInputComponent";
import Breadcrumb from "@/Components/Tenant/PageComponent/BreadcrumbComponent";
import TableCardComponent from "@/Components/Tenant/PageComponent/TableCardComponent";
import { TenantSocialLinkSchema } from "@/schemas/tenants/tenantSocialLinkSchema";
import { TenantSocialLinkCreateInputs } from "@/utils/forms/socialLinkInputs";
import { SocialLinkListNavItems } from "@/utils/common/BreadcrumbNavItems";
import ResetFormButtonComponent from "@/Components/Tenant/Buttons/ResetFormButtonComponent";
import { swalToast } from "@/utils/toast";
import { useForm, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";
import ButtonComponent from "@/Components/ButtonComponent";

export default function SocialLinkEditPage() {
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Social links");
    const { tenant, routeNames, socialLinks } = usePage().props;
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
        name: socialLinks?.name || "",
    });
    const { toastAlert } = usePage().props;

    const schema = useMemo(() => TenantSocialLinkSchema(__), []);

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
            route(routeNames.socialLinksUpdate, {
                tenant,
                social_link: socialLinks.id,
            }),
            data,
            {
                preserveScroll: true,
                onSuccess: (response) => {
                    // Handle success
                    console.log("Model updated successfully");
                },
                onError: (errors) => {
                    // Handle errors
                    console.error("Update failed:", errors);
                },
            }
        );
    };

    const resetData = (formId = "") => {
           setData({ name: "", });
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
        <TenantSettingLayout metaTitle={metaTitle}>
            <Breadcrumb
                title={metaTitle}
                navItems={[...SocialLinkListNavItems, { name: "Edit" }]}
                btnIcon="list"
                link="tenant.social-links.index"
            ></Breadcrumb>
            <TableCardComponent>
                <form
                    className="space-y-6"
                    onSubmit={handleModelUpdate}
                    noValidate
                >
                    {/* Single Input Field */}
                    {TenantSocialLinkCreateInputs.map((field) => (
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

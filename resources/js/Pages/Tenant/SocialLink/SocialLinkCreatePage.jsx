import TenantSettingLayout from "@/Components/Tenant/TenantSettingLayout";
import { useTranslations } from "@/hooks/useTranslations";
import CommonFormInputComponent from "@/Components/Tenant/Forms/CommonFormInputComponent";
import Breadcrumb from "@/Components/Tenant/PageComponent/BreadcrumbComponent";
import TableCardComponent from "@/Components/Tenant/PageComponent/TableCardComponent";
import ResetFormButtonComponent from "@/Components/Tenant/Buttons/ResetFormButtonComponent";
import { TenantSocialLinkSchema } from "@/schemas/tenants/tenantSocialLinkSchema";
import { TenantSocialLinkCreateInputs } from "@/utils/forms/socialLinkInputs";
import { SocialLinkListNavItems } from "@/utils/common/BreadcrumbNavItems";
import { swalToast } from "@/utils/toast";
import ButtonComponent from "@/Components/ButtonComponent";
import { router, useForm, usePage } from "@inertiajs/react";
import Select from "react-select";
import React, { useEffect, useMemo, useState } from "react";
import { useRoute } from "ziggy";

export default function SocialLinkCreatePage() {
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Social links");
    const { tenant, routeNames, socialLinks } = usePage().props;

    const { data, setData, post, processing, errors, setError, clearErrors } =
        useForm({
            socialLink: "",
        });
    const { toastAlert } = usePage().props;
    const socialLinkInputs = useMemo(() => {
        return TenantSocialLinkCreateInputs.map((field) => {
            if (field.name === "socialLink") {
                return {
                    ...field,
                    options: [
                        {
                            optValue: "",
                            optLabel: "Select Social Link",
                            isDisabled: false,
                        },
                        ...socialLinks.map((socialLink) => ({
                            optValue: socialLink.value,
                            optLabel: socialLink.label,
                            isDisabled: false,
                        })),
                    ],
                };
            }
            return field;
        });
    }, [socialLinks]);

    const schema = useMemo(() => TenantSocialLinkSchema(__), []);

    const handleModelSubmit = (e) => {
        console.log(data);

        e.preventDefault();
        clearErrors();
        const { error } = schema.validate(
            {
                socialLink: data.socialLink,
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
        post(route(routeNames.socialLinksStore, { tenant }), data, {
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
    }, [toastAlert]);

    return (
        <TenantSettingLayout metaTitle={metaTitle}>
            <Breadcrumb
                title={metaTitle}
                btnIcon="list"
                navItems={[...SocialLinkListNavItems, { name: "Create" }]}
                link="tenant.social-links.index"
            ></Breadcrumb>
            <TableCardComponent>
                <form
                    id=""
                    className="space-y-6"
                    onSubmit={handleModelSubmit}
                    noValidate
                >
                    {/* Single Input Field */}
                    {socialLinkInputs.map((field) => (
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

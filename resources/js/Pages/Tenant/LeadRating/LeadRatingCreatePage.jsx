import TenantSettingLayout from "@/Components/Tenant/TenantSettingLayout";
import { useTranslations } from "@/hooks/useTranslations";
import UserFormInputComponent from "@/Components/Tenant/Forms/UserFormInputComponent";
import Breadcrumb from "@/Components/Tenant/PageComponent/BreadcrumbComponent";
import TableCardComponent from "@/Components/Tenant/PageComponent/TableCardComponent";
import ResetFormButtonComponent from "@/Components/Tenant/Buttons/ResetFormButtonComponent";
import { TenantLeadRatingSchema } from "@/schemas/tenants/tenantLeadRatingSchema";
import { TenantLeadRatingCreateInputs } from "@/utils/forms/leadRatingInputs";
import { LeadRatingListNavItems } from "@/utils/common/BreadcrumbNavItems";
import { swalToast } from "@/utils/toast";
import { router, useForm, usePage } from "@inertiajs/react";
import React, { useEffect, useMemo } from "react";
import { useRoute } from "ziggy";
import ButtonComponent from "@/Components/ButtonComponent";

export default function LeadRatingCreatePage() {
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Rating");
    const { tenant, routeNames, dataRatings } = usePage().props;
    const { data, setData, post, processing, errors, setError, clearErrors } =
        useForm({
            name: "",
            rating: "",
        });
    const { toastAlert } = usePage().props;
    const RatingCreateInputs = useMemo(() => {
        return TenantLeadRatingCreateInputs.map((field) => {
            if (field.name === "rating") {
                return {
                    ...field,
                    options: [
                        {
                            optValue: "",
                            optLabel: "Select Rating",
                            isDisabled: false,
                        },
                        ...dataRatings.map((rating) => ({
                            optValue: rating.value,
                            optLabel: rating.label,
                            isDisabled: false,
                        })),
                    ],
                };
            }

            return field;
        });
    }, [dataRatings]);

    const schema = useMemo(() => TenantLeadRatingSchema(__), []);

    const handleModuleSubmit = (e) => {
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

        post(route(routeNames.leadRatingsStore, { tenant }), data, {
            preserveScroll: true,
            onSuccess: () => {
                console.log(errors);
                console.log("Submitted!");
            },
        });
    };
    const resetData = (formId) => {
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
                    rating: "",
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
                navItems={[...LeadRatingListNavItems, { name: "Create" }]}
                link="tenant.lead-ratings.index"
            ></Breadcrumb>
            <TableCardComponent>
                <form
                    id=""
                    className="space-y-6"
                    onSubmit={handleModuleSubmit}
                    noValidate
                >
                    {/* Single Input Field */}
                    {RatingCreateInputs.map((field) => (
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

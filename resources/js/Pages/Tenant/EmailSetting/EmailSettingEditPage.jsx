import TenantSettingLayout from "@/Components/Tenant/TenantSettingLayout";
import { useTranslations } from "@/hooks/useTranslations";
import CommonFormInputComponent from "@/Components/Tenant/Forms/CommonFormInputComponent";
import ResetFormButtonComponent from "@/Components/Tenant/Buttons/ResetFormButtonComponent";
import Breadcrumb from "@/Components/Tenant/PageComponent/BreadcrumbComponent";
import TableCardComponent from "@/Components/Tenant/PageComponent/TableCardComponent";
import { TenantEmailSettingSchema } from "@/schemas/tenants/tenantEmailSettingSchema";
import { EmailSettingCreateInputs } from "@/utils/forms/emailSettingInputs";
import { EmailSettingListNavItems } from "@/utils/common/BreadcrumbNavItems";
import { swalToast } from "@/utils/toast";
import { router, useForm, usePage } from "@inertiajs/react";
import React, { useEffect, useMemo } from "react";
import { useRoute } from "ziggy";
import ButtonComponent from "@/Components/ButtonComponent";

export default function EmailSettingEditPage() {
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Email Setting");
    const { tenant, routeNames, dataList } = usePage().props;
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
        host: dataList?.host || "",
        port: dataList?.port || "",
        password: dataList?.password || "",
        encryption: dataList?.encryption || "",
        userName: dataList?.user_name || "",
        mailFromAddress: dataList?.mail_from_address || "",
    });
    const { toastAlert } = usePage().props;

    const schema = useMemo(() => TenantEmailSettingSchema(__), []);

    const handleModelUpdate = (e) => {
        e.preventDefault();

        clearErrors();
        const { error } = schema.validate(
            {
                host: data.host,
                port: data.port,
                password: data.password,
                encryption: data.encryption,
                userName: data.userName,
                mailFromAddress: data.mailFromAddress,
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
            route(routeNames.emailSettingUpdate, {
                tenant,
                email_setting: dataList.id,
            }),
            data,
            {
                preserveScroll: true,
                onSuccess: (response) => {
                    // Handle success
                    console.log("Resource updated successfully");
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
    }, [toastAlert]);

    const resetData = (formId) => {
        setData({
            name: "",
            host: "",
            port: "",
            password: "",
            encryption: "",
            userName: "",
            mailFromAddress: "",
        });
    };

    return (
        <TenantSettingLayout metaTitle={metaTitle}>
            <Breadcrumb
                title={metaTitle}
                navItems={[...EmailSettingListNavItems, { name: "Edit" }]}
                btnIcon="list"
                link="tenant.email-setting.index"
            ></Breadcrumb>
            <TableCardComponent>
                <form
                    className="space-y-6"
                    onSubmit={handleModelUpdate}
                    noValidate
                >
                    {/* Single Input Field */}
                    {EmailSettingCreateInputs.map((field) => (
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

import React, { useEffect, useMemo, useState } from "react";
import { router, useForm, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";
import TenantSettingLayout from "@/Components/Tenant/TenantSettingLayout";
import { useTranslations } from "@/hooks/useTranslations";
import UserFormInputComponent from "@/Components/Tenant/Forms/UserFormInputComponent";
import TableCardComponent from "@/Components/Tenant/PageComponent/TableCardComponent";
import Breadcrumb from "@/Components/Tenant/PageComponent/BreadcrumbComponent";
import { TenantUserCreateInputs } from "@/utils/forms/userInputs";
import { TenantUserRegisterSchema } from "@/schemas/tenants/tenantSchema";
import { UserListNavItems } from "@/utils/common/BreadcrumbNavItems";
import { swalToast } from "@/utils/toast";
import CardSimple from "@/Components/Tenant/Addons/CardSimple";
import DataFormFooterActionComponent from "@/Components/Tenant/Addons/DataFormFooterActionComponent";
import AlertComponent from "@/Components/Tenant/Addons/AlertComponent";
import CardDataModelFaq from "@/Components/Tenant/Addons/CardDataModelFaq";

/**
 * @component UserCreatePage
 * User Create Page Component
 *
 * @description
 * This page allows administrators to create a new user within a tenant in the CRM system.
 * It provides a form to input user details (name, email, role, and optional department),
 * performs client-side validation using Joi, and submits the data via Inertia.js POST request.
 *
 * Key features:
 * - Dynamic dropdowns for roles and departments populated from server props
 * - Client-side validation with detailed error feedback
 * - Success alert reminding that a verification email will be sent
 * - Toast notifications handled via useEffect
 * - Responsive two-column layout with form on the left and informational sidebar on the right
 * - Footer actions: Save, Save & New (not implemented in current logic), Reset, and Go Back
 *
 * The component maintains all original functionality while improving readability and structure.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author Mamun <mamunhossen149191@gmail.com>
 */
export default function UserCreatePage() {
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Users");
    const sectionTitle = __("Create user");

    const { tenant, routeNames, roles, departments, toastAlert } =
        usePage().props;

    /** Form handling with Inertia useForm */
    const { data, setData, post, processing, errors, setError, clearErrors } =
        useForm({
            name: "",
            email: "",
            role: "",
            department: "",
        });

    /** Controls visibility of email verification success alert */
    const [showAlertBox, setShowAlertBox] = useState(false);

    /** Prepare form input configuration with dynamic options for role & department */
    const usersInputs = useMemo(() => {
        return TenantUserCreateInputs.map((field) => {
            /* Completely skip (remove) the is_active field */
            if (field.name === "is_active") {
                return null;
            }

            if (field.name === "role") {
                return {
                    ...field,
                    options: roles.map((role) => ({
                        optValue: role.id,
                        optLabel: role.name,
                        isDisabled: false,
                    })),
                };
            }

            if (field.name === "department") {
                return {
                    ...field,
                    options: [
                        {
                            optValue: "",
                            optLabel: "Select department",
                            isDisabled: false,
                        },
                        ...departments.map((department) => ({
                            optValue: department.id,
                            optLabel: department.name,
                            isDisabled: false,
                        })),
                    ],
                };
            }

            return field;
        }).filter(Boolean);
    }, [roles, departments]);

    /** Memoized validation schema to avoid recreation on every render */
    const schema = useMemo(() => TenantUserRegisterSchema(__), [__]);

    /**
     * Handle form submission with client-side Joi validation
     */
    const handleModelSubmit = (e) => {
        e.preventDefault();
        clearErrors();

        const { error } = schema.validate(
            {
                name: data.name,
                email: data.email,
                role: data.role,
            },
            { abortEarly: false }
        );

        if (error) {
            const joiErrors = {};
            error.details.forEach((detail) => {
                const field = detail.path[0];
                joiErrors[field] = detail.message;
            });
            setError(joiErrors);
            return;
        }

        post(route(routeNames.usersStore, { tenant }), {
            preserveScroll: true,
            onSuccess: () => {
                setShowAlertBox(true);
            },
        });
    };

    /** Display toast alerts from server (flash messages) */
    useEffect(() => {
        if (toastAlert?.message) {
            swalToast({
                ...toastAlert,
                message: __([toastAlert.message]),
            });

            if (toastAlert.type === "success") {
                setData({
                    name: "",
                    email: "",
                    role: "",
                    department: "",
                });
            }
        }
        router.reload({ only: [] });
    }, [toastAlert]);

    /** Reset form fields and errors */
    const resetData = () => {
        clearErrors();
        setData({
            name: "",
            email: "",
            role: "",
            department: "",
        });
    };

    return (
        <TenantSettingLayout metaTitle={__(sectionTitle)}>
            <Breadcrumb
                title={metaTitle}
                iconTitle="User list"
                btnIcon="list"
                navItems={[...UserListNavItems, { name: "Create" }]}
                link="tenant.users.index"
            />

            <TableCardComponent>
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    {/* Main Form Section */}
                    <aside id="formSection" className="lg:col-span-2 space-y-3">
                        <CardSimple
                            title={__("Create user")}
                            footerComponent={
                                <DataFormFooterActionComponent
                                    onGoBack={() => {
                                        router.visit(
                                            route(routeNames.usersList, {
                                                tenant,
                                            })
                                        );
                                    }}
                                    onReset={resetData}
                                    onSubmit={handleModelSubmit}
                                    processing={processing}
                                />
                            }
                        >
                            <form
                                className="space-y-3 px-0 grid grid-cols-1 md:grid-cols-2 gap-3 mb-3"
                                noValidate
                            >
                                {usersInputs.map((field) => (
                                    <UserFormInputComponent
                                        key={field.name}
                                        field={field}
                                        data={data}
                                        errors={errors}
                                        setData={setData}
                                        className=""
                                    />
                                ))}
                            </form>
                        </CardSimple>
                    </aside>

                    {/* Sidebar Information Section */}
                    <aside id="infoSection" className="space-y-3">
                        {showAlertBox && (
                            <AlertComponent
                                title="Email verification alert"
                                subTitle="A email will be sent to the user to verify their email address after creating the user. Until then, the user will not be able to log in. Please ensure the email address is correct"
                                icon="email"
                                type="success"
                                handleShowAlertBox={setShowAlertBox}
                                showAlertBox={showAlertBox}
                            />
                        )}

                        <CardDataModelFaq title="Purpose of users in the crm">
                            These users are assigned specific roles and
                            permissions, allowing them to handle sales
                            activities such as lead follow-ups, deal management,
                            communication tracking, and customer relationship
                            maintenance. This structure ensures clear ownership,
                            accountability, and efficient collaboration across
                            the sales process
                        </CardDataModelFaq>
                    </aside>
                </section>
            </TableCardComponent>
        </TenantSettingLayout>
    );
}

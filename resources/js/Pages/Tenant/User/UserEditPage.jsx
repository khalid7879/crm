import React, { useEffect, useMemo } from "react";
import { router, useForm, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";
import TenantSettingLayout from "@/Components/Tenant/TenantSettingLayout";
import { useTranslations } from "@/hooks/useTranslations";
import UserFormInputComponent from "@/Components/Tenant/Forms/UserFormInputComponent";
import TableCardComponent from "@/Components/Tenant/PageComponent/TableCardComponent";
import { UserListNavItems } from "@/utils/common/BreadcrumbNavItems";
import Breadcrumb from "@/Components/Tenant/PageComponent/BreadcrumbComponent";
import { TenantUserRegisterSchema } from "@/schemas/tenants/tenantSchema";
import { TenantUserCreateInputs } from "@/utils/forms/userInputs";
import { swalToast } from "@/utils/toast";
import CardSimple from "@/Components/Tenant/Addons/CardSimple";
import DataFormFooterActionComponent from "@/Components/Tenant/Addons/DataFormFooterActionComponent";
import CardDataModelFaq from "@/Components/Tenant/Addons/CardDataModelFaq";
import CardDataModelDelete from "@/Components/Tenant/Addons/CardDataModelDelete";
import CardDataModelInfo from "@/Components/Tenant/Addons/CardDataModelInfo";

/**
 * @component
 * UserEditPage Component
 *
 * @description
 * This component renders the edit page for a tenant user within the CRM system.
 * It provides a responsive form to update user details including name, email, role(s),
 * and department. The layout uses a two-column design on larger screens:
 * - Main section (2/3 width): Form inside a CardSimple with footer actions (Back, Reset, Submit)
 * - Sidebar (1/3 width): Informational FAQ about the purpose of users in the CRM
 *
 * Features:
 * - Client-side validation using Joi via TenantUserRegisterSchema
 * - Dynamic role and department dropdown options populated from props
 * - Inertia.js PUT request for updating the user
 * - Success toast notification on successful update
 * - Reset functionality restores original user data
 * - Breadcrumb navigation with proper context
 * - Toast alerts from server flashed messages
 *
 * All existing functionality (validation, submission, toasts, resets) is preserved.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author Mamun <mamunhossen149191@gmail.com>
 */
export default function UserEditPage() {
    const route = useRoute();
    const __ = useTranslations();

    /** Section title used for page meta and layout */
    const sectionTitle = "Edit user information";
    const metaTitle = __("Users");

    const { tenant, routeNames, users, roles, departments, toastAlert } =
        usePage().props;

    const {
        data,
        setData,
        put,
        processing,
        errors,
        setError,
        clearErrors,
        transform,
    } = useForm({
        name: users?.name || "",
        email: users?.email || "",
        role: users?.roles?.map((role) => role.id) || [],
        department: users?.get_department?.id || "",
        is_active: users?.is_active === "1" ? true : false,
    });

    /** Dynamically build form input configurations with role & department options */
    const usersInputs = useMemo(() => {
        return TenantUserCreateInputs.map((field) => {
            /* Completely skip (remove) the is_active field */
            if (field.name === "is_active" && users?.is_active === "2") {
                return null;
            }

            /* Role field – populate options */
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

            /* Department field – add placeholder + options */
            if (field.name === "department") {
                return {
                    ...field,
                    options: [
                        {
                            optValue: "",
                            optLabel: __("Select Department"),
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
        }).filter(Boolean); // Removes null/undefined entries (i.e. the is_active field)
    }, [roles, departments, __]);

    /** Memoized validation schema */
    const schema = useMemo(() => TenantUserRegisterSchema(__), [__]);

    /** Handle form submission with client-side validation */
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

        if (!error) {
            put(route(routeNames.usersUpdate, { tenant, user: users.id }), {
                preserveScroll: true,
                onSuccess: () => {
                    swalToast({
                        icon: "success",
                        title: __("User updated successfully"),
                    });
                },
                onError: (errors) => {
                    setError(errors);
                },
            });
        }
    };

    /** Display flashed toast messages from server */
    useEffect(() => {
        if (toastAlert?.message) {
            swalToast({
                ...toastAlert,
                message: __(toastAlert.message),
            });
        }
        router.reload({ only: [] });
    }, [toastAlert]);

    /** Reset form to original user values */
    const resetData = () => {
        setData({
            name: users?.name || "",
            email: users?.email || "",
            role: users?.roles?.map((role) => role.id) || [],
            department: users?.get_department?.id || "",
            is_active: users?.is_active === "1" ? true : false,
        });
        clearErrors();
    };

    /** Navigate back to users list */
    const handleGoBack = () => {
        router.visit(
            route(routeNames.usersList || "tenant.users.index", { tenant })
        );
    };

    transform((data) => ({
        ...data,
        is_active: users?.is_active === "2" ? "2" : data.is_active ? "1" : "0",
    }));

    return (
        <TenantSettingLayout metaTitle={__(sectionTitle)}>
            <Breadcrumb
                title={metaTitle}
                iconTitle={__("User list")}
                btnIcon="list"
                navItems={[...UserListNavItems, { name: __("Edit") }]}
                link="tenant.users.index"
            />

            <TableCardComponent>
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    {/* Main Form Section */}
                    <aside id="formSection" className="lg:col-span-2 space-y-3">
                        <CardSimple
                            title={__(sectionTitle)}
                            footerComponent={
                                <DataFormFooterActionComponent
                                    onGoBack={handleGoBack}
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
                        <CardDataModelInfo
                            cardTitle="User details"
                            modelName={users?.name}
                            modelCreated={users?.model_time?.create_date}
                            modelUpdated={users?.model_time?.update_diff}
                            firstLetter={users?.first_letter}
                            extraAttributes={users?.get_model_stats?.primary}
                        />
                        <CardDataModelDelete />
                        <CardDataModelFaq
                            title={__("Purpose of users in the crm")}
                        >
                            {__(
                                "These users are assigned specific roles and permissions, allowing them to handle sales activities such as lead follow-ups, deal management, communication tracking, and customer relationship maintenance. This structure ensures clear ownership, accountability, and efficient collaboration across the sales process"
                            )}
                        </CardDataModelFaq>
                    </aside>
                </section>
            </TableCardComponent>
        </TenantSettingLayout>
    );
}

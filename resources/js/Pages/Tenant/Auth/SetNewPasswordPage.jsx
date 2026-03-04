import React, { useEffect, useMemo, useState } from "react";
import { useForm, router, usePage, Link } from "@inertiajs/react";
import { useRoute } from "ziggy";
import TermsOfServiceAcknowledgeComponent from "@/Components/Tenant/Addons/TermsOfServiceAcknowledgeComponent";
import AuthLayout from "@/Components/Tenant/AuthLayout";
import AuthFormInputComponent from "@/Components/Tenant/Forms/AuthFormInputComponent";
import { useTranslations } from "@/hooks/useTranslations";
import { TenantResetPasswordSchema } from "@/schemas/tenants/tenantSchema";
import { TenantUserResetPasswordForm } from "@/utils/inputs";
import { swalToast } from "@/utils/toast";
import AuthHeaderComponent from "@/Components/Tenant/Addons/AuthHeaderComponent";

/**
 * @component
 * SetNewPasswordPage
 *
 * @description
 * This page allows a tenant user to set a new password after receiving a password reset link.
 * It handles client-side validation using Joi (via TenantResetPasswordSchema), form submission
 * via Inertia.js, error handling, processing states, and displays a toast notification if
 * one is passed via page props.
 *
 * Features:
 * - Displays the user's email (read-only) from page props
 * - Renders password and confirm password fields defined in TenantUserResetPasswordForm
 * - Validates input with Joi schema before submitting
 * - Submits the new password to the server using Inertia post()
 * - Shows processing state on submit button
 * - Displays server or client validation errors
 * - Includes Terms of Service acknowledgment component
 * - Provides a link back to login page
 * - Shows toast alerts from flash messages (via page props)
 *
 * @returns {JSX.Element} The complete password reset form within AuthLayout
 *
 * @example
 * <route name="tenant.setNewPassword" ... />
 * - Rendered when user clicks password reset link with valid token/email
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author Mamun <mamunhossen149191@gmail.com>
 */
export default function SetNewPasswordPage() {
    const route = useRoute();
    const __ = useTranslations();
    const { toastAlert, routeNames, email } = usePage().props;
    const metaTitle = __("Reset password");

    /* Memoize schema to prevent recreation on every render (depends only on translations) */
    const schema = useMemo(() => TenantResetPasswordSchema(__), []);

    const {
        data,
        setData,
        post,
        processing,
        errors = {},
        setError,
        clearErrors,
    } = useForm({
        password: "",
        confirmPassword: "",
        email: email || "",
    });

    /* Debug log (safe to keep in dev, consider removing in production if needed) */

    const handleSubmit = (e) => {
        e.preventDefault();

        /* Client-side validation using Joi */
        const { error } = schema.validate(
            {
                password: data.password,
                email: data.email,
                confirmPassword: data.confirmPassword,
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

        /* Safety check for route name */
        if (!routeNames?.setNewPasswordProcess) {
            return;
        }

        /* Submit to server via Inertia */
        post(route(routeNames.setNewPasswordProcess), {
            preserveScroll: true,
            onSuccess: () => {
                /* Optional: redirect can be added later if needed */
            },
            onError: (err) => {
                console.error("Server validation failed:", err);
            },
        });
    };

    /* Show toast alert only when it changes (prevents duplicate toasts) */
    useEffect(() => {
        if (toastAlert?.message) {
            swalToast({
                ...toastAlert,
                message: __([toastAlert.message]),
            });
        }
    }, [toastAlert, __]);

    return (
        <AuthLayout metaTitle={metaTitle}>
            <main>
                <form onSubmit={handleSubmit} noValidate className="space-y-3">
                    <section className="space-y-0 transition-all duration-300">
                        <AuthHeaderComponent
                            title={__("Set new password")}
                        ></AuthHeaderComponent>

                        <fieldset className="space-y-3">
                            <legend className="sr-only">
                                {__("Account information")}
                            </legend>

                            {/* Display email associated with reset request */}
                            <span className="font-semibold italic text-xl text-base-300/50 text-center mb-3 block">
                                {email}
                            </span>
                            {/* Render password fields */}
                            {TenantUserResetPasswordForm.map((field) => (
                                <AuthFormInputComponent
                                    key={field.name}
                                    field={field}
                                    data={data}
                                    errors={errors}
                                    setData={setData}
                                    joinBtnText={field.joinBtnText}
                                />
                            ))}
                        </fieldset>
                    </section>

                    {/* Terms of Service acknowledgment */}
                    <article>
                        <TermsOfServiceAcknowledgeComponent />
                    </article>

                    <footer>
                        <button
                            type="submit"
                            disabled={processing}
                            className={`mt-0 cursor-pointer w-full h-9 text-white font-bold text-lg transition-all duration-300 shadow-lg ${
                                processing
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-brandColor"
                            }`}
                        >
                            {processing ? (
                                <>
                                    <span
                                        className="loading loading-spinner mr-2"
                                        aria-hidden="true"
                                    ></span>
                                    {__("Processing dots")}
                                </>
                            ) : (
                                <span>{__("Change password")}</span>
                            )}
                        </button>

                        <p className="text-center text-[12px] text-gray-500 mt-3">
                            <Link
                                href={route(routeNames.login)}
                                className="text-gray-700 font-semibold hover:underline"
                            >
                                {__("Sign in")}
                            </Link>
                            &nbsp;/&nbsp;
                            <Link
                                href={route(routeNames.register)}
                                className="text-gray-700 font-semibold hover:underline"
                            >
                                {__("Sign up")}
                            </Link>
                        </p>
                    </footer>
                </form>
            </main>
        </AuthLayout>
    );
}

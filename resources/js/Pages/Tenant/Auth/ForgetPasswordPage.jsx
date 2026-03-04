import React, { useEffect, useMemo } from "react";
import { useForm, usePage, Link } from "@inertiajs/react";
import TermsOfServiceAcknowledgeComponent from "@/Components/Tenant/Addons/TermsOfServiceAcknowledgeComponent";
import AuthLayout from "@/Components/Tenant/AuthLayout";
import AuthFormInputComponent from "@/Components/Tenant/Forms/AuthFormInputComponent";
import { useTranslations } from "@/hooks/useTranslations";
import { TenantEmailSchema } from "@/schemas/tenants/tenantSchema";
import { TenantForgetPasswordForm } from "@/utils/inputs";
import { swalToast } from "@/utils/toast";
import IconComponent from "@/Components/IconComponent";
import { useRoute } from "ziggy";
import AuthHeaderComponent from "@/Components/Tenant/Addons/AuthHeaderComponent";

/**
 * @component
 * LoginPage Component
 *
 * @description
 * Renders the tenant login form for the CRM dashboard. Includes:
 * - Email and password fields using `AuthFormInputComponent`
 * - Form validation, error handling, and Inertia form submission
 * - “Remember me” checkbox
 * - Primary login button with loading state
 * - Google OAuth button (coming soon)
 * - Links for password reset and registration
 *
 * The component is built with Tailwind + DaisyUI v5 for styling
 * and integrates with Inertia.js form helpers.
 *
 * @param {Object} props - Component props.
 * @param {Object} props.auth - Authentication-related data from backend.
 * @param {string} [props.status] - Optional Inertia status message.
 *
 * @returns {JSX.Element} The rendered LoginPage UI.
 *
 * @example
 * <LoginPage
 *     auth={{ user: null }}
 *     status={sessionStatus}
 * />
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author Mamun <mamunhossen149191@gmail.com>
 */

export default function ForgetPasswordPage({ routeNames = {} }) {
    const __ = useTranslations();
    const { toastAlert } = usePage().props;

    /** Create Joi validation schema memoized to avoid recreation on re-render */
    const schema = useMemo(() => TenantEmailSchema(__), []);

    const route = useRoute();
    const metaTitle = __("Forgot password");

    /** Initialize form state and helpers */
    const {
        data,
        setData,
        post,
        get,
        processing,
        errors,
        setError,
        clearErrors,
    } = useForm({
        email: "",
    });

    /** Handle form submit with validation before posting */
    const handleSubmit = (e) => {
        e.preventDefault();
        clearErrors();
        const { error } = schema.validate(
            { email: data.email },
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
            swalToast({
                type: "error",
                message: __("Invalid credentials"),
            });
            return;
        }
        clearErrors();
        post(route(routeNames.forgetPasswordEmailValidate), {
            preserveScroll: true,
            onSuccess: () => {},
        });
    };

    /** Toast effect: show only once per unique message */
    useEffect(() => {
        if (toastAlert && toastAlert.message) {
            swalToast({ ...toastAlert, message: __([toastAlert.message]) });
        }
    }, [toastAlert]);

    const handleAuthRoute = (e) => {
        e.preventDefault();
        window.location.href = route("auth.google");
    };

    return (
        <AuthLayout metaTitle={metaTitle}>
            <form onSubmit={handleSubmit} noValidate>
                {/* Login input fields section */}
                <section className="space-y-0 transition-all duration-300">
                    <AuthHeaderComponent
                        title={__(metaTitle)}
                    ></AuthHeaderComponent>
                    <fieldset className="space-y-5">
                        <legend className="sr-only">
                            {__("Account information")}
                        </legend>
                        {TenantForgetPasswordForm.map((field) => (
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

                {/* Terms of service */}
                <article>
                    <TermsOfServiceAcknowledgeComponent />
                </article>

                {/* Submit button */}
                <footer>
                    <button
                        type="submit"
                        disabled={processing}
                        className={`mt-3 cursor-pointer w-full h-9  text-white font-bold text-lg transition-all duration-300 shadow-lg  ${
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
                            <span>{__("Send recovery link")}</span>
                        )}
                    </button>

                    <button
                        onClick={handleAuthRoute}
                        type="button"
                        disabled={processing}
                        className={`
                            mt-3 w-full h-10 
                            flex items-center justify-center gap-2
                            bg-white border border-gray-300 
                            text-gray-700 font-semibold text-sm
                            shadow-sm 
                            hover:shadow-md hover:bg-gray-50
                            transition-all duration-200
                            ${
                                processing
                                    ? "opacity-70 cursor-not-allowed"
                                    : "cursor-pointer"
                            }
                        `}
                    >
                        <IconComponent
                            icon="googleColorful"
                            classList="w-4 h-4 text-gray-600"
                        />
                        <span className="tracking-wide">
                            {__("Sign in with Google")}
                        </span>
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
        </AuthLayout>
    );
}

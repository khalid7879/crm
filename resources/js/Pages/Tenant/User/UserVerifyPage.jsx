import React, { useEffect, useMemo, useState } from "react";
import { Link, useForm, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";
import AuthLayout from "@/Components/Tenant/AuthLayout";
import AuthFormInputComponent from "@/Components/Tenant/Forms/AuthFormInputComponent";
import TermsOfServiceAcknowledgeComponent from "@/Components/Tenant/Addons/TermsOfServiceAcknowledgeComponent";
import { useTranslations } from "@/hooks/useTranslations";
import { TenantUserEmailVerifySchema } from "@/schemas/tenants/tenantSchema";
import { TenantUserRegistrationVerify } from "@/utils/inputs";
import { swalToast } from "@/utils/toast";
import IconComponent from "@/Components/IconComponent";

/**
 * @component UserVerifyPage
 * Tenant Inner User Verify Page Component
 *
 * @description
 * This component handles the email verification step during tenant user registration.
 * It displays a form where the user must enter the verification token (OTP/code) sent to their email,
 * set a new password, and confirm it. The email is pre-filled and read-only from props.
 *
 * Key Features:
 * - Client-side validation using Joi schema (TenantUserEmailVerifySchema)
 * - Inertia.js form submission (POST) to verify the token and complete registration
 * - Resend verification token functionality with loading state
 * - Displays server flash toast messages
 * - Integrates Terms of Service acknowledgment component
 * - Responsive authentication layout with styled submit button and processing state
 * - Accessible markup with proper ARIA and semantic elements
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author Mamun <mamunhossen149191@gmail.com>
 */
export default function UserVerifyPage() {
    const route = useRoute();
    const __ = useTranslations();
    const { toastAlert, routeNames, email = "" } = usePage().props;

    const metaTitle = __("Verify yourself");

    /** Memoized Joi validation schema */
    const schema = useMemo(() => TenantUserEmailVerifySchema(__), [__]);

    const {
        data,
        setData,
        post,
        processing,
        errors = {},
        setError,
        clearErrors,
    } = useForm({
        verifyToken: "",
        password: "",
        email: email || "",
        confirmPassword: "",
        model: "App\\Models\\User",
    });

    const [resending, setResending] = useState(false);

    /** Handle form submission */
    const handleSubmit = (e) => {
        e.preventDefault();
        clearErrors();

        const { error } = schema.validate(
            {
                verifyToken: data.verifyToken,
                password: data.password,
                email: data.email,
                confirmPassword: data.confirmPassword,
            },
            { abortEarly: false }
        );

        if (error) {
            const joiErrors = {};
            error.details.forEach((detail) => {
                joiErrors[detail.path[0]] = detail.message;
            });
            setError(joiErrors);
            swalToast({
                type: "error",
                message: __("Please correct the errors"),
            });
            return;
        }

        if (!routeNames?.userVerifyProcess) return;

        post(route(routeNames.userVerifyProcess), { preserveScroll: true });
    };

    /** Resend verification token */
    const handleResend = (e) => {
        e.preventDefault();
        setResending(true);
        post(route(routeNames.resendVerifyToken), {
            preserveScroll: true,
            onFinish: () => setResending(false),
            onSuccess: () => {
                swalToast({
                    type: "success",
                    message: __("Verification code resent successfully"),
                });
            },
        });
    };

    /** Show toast notifications */
    useEffect(() => {
        if (toastAlert?.message)
            swalToast({ ...toastAlert, message: __([toastAlert.message]) });
    }, [toastAlert]);

    return (
        <AuthLayout metaTitle={metaTitle}>
            <main className="space-y-6">
                {email ? (
                    <form
                        onSubmit={handleSubmit}
                        noValidate
                        className="space-y-3"
                    >
                        {/* Verification Icon */}
                        <div className="flex justify-center">
                            <IconComponent
                                icon="followup2"
                                classList="text-8xl text-brandColor/70"
                            />
                        </div>

                        {/* Instructions */}
                        <p className="text-gray-500 text-[12px] text-center">
                            {__(
                                "Enter the otp received by email and set your password below"
                            )}
                            <br />
                            <span className="font-semibold italic text-xl text-base-300/50">
                                {email}
                            </span>
                        </p>

                        {/* Input Fields */}
                        <fieldset className="space-y-5">
                            <legend className="sr-only">
                                {__("Verification & Password")}
                            </legend>
                            {TenantUserRegistrationVerify.map((field) => (
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

                        {/* Terms of Service */}
                        <div className="mt-3">
                            <TermsOfServiceAcknowledgeComponent />
                        </div>

                        {/* Buttons */}
                        <footer className="mt-3">
                            <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`bg-brandColor btn-sm min-h-9 w-full lg:w-2/3 cursor-pointer ${
                                        processing
                                            ? "cursor-not-allowed"
                                            : "bg-brandColor"
                                    }`}
                                >
                                    {processing && !resending ? (
                                        <>
                                            <span className="loading loading-spinner mr-2"></span>
                                            {__("Processing dots")}
                                        </>
                                    ) : (
                                        <>{__("Complete registration")}</>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={resending}
                                    className={`bg-gray-500 w-full lg:w-1/3 min-h-9 cursor-pointer ${
                                        resending && "btn-disabled"
                                    }`}
                                >
                                    {resending
                                        ? __("Sending")
                                        : __("Resend otp")}
                                </button>
                            </div>

                            {/* Navigation Links */}
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
                ) : (
                    /** Fallback when no email is provided */
                    <div className="text-center space-y-8">
                        <IconComponent
                            icon="followup2"
                            classList="text-8xl text-brandColor/70 mx-auto"
                        />

                        <div className="alert alert-warning alert-soft alert-vertical sm:alert-horizontal bg-base-200">
                            <IconComponent icon="info" classList="text-2xl" />
                            <div className="text-brandColor">
                                <h3 className="font-bold text-xl">
                                    {__("Oops")}
                                </h3>
                                <div className="text-sm">
                                    {__(
                                        "It looks like something went wrong. Please try registering again."
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center gap-1">
                            <Link
                                href={route(routeNames.login)}
                                className="btn btn-sm btn-outline text-gray-500"
                            >
                                {__("Sign in")}
                            </Link>
                            &nbsp;/&nbsp;
                            <Link
                                href={route(routeNames.register)}
                                className="btn btn-sm btn-outline text-gray-500"
                            >
                                {__("Sign up")}
                            </Link>
                        </div>
                    </div>
                )}
            </main>
        </AuthLayout>
    );
}

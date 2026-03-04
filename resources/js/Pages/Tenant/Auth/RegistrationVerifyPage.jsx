import React, { useEffect, useMemo, useState } from "react";
import { Link, router, useForm, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";
import AuthLayout from "@/Components/Tenant/AuthLayout";
import AuthFormInputComponent from "@/Components/Tenant/Forms/AuthFormInputComponent";
import { useTranslations } from "@/hooks/useTranslations";
import { TenantEmailVerifySchema } from "@/schemas/tenants/tenantSchema";
import { TenantGlobalRegistrationVerify } from "@/utils/inputs";
import { swalToast } from "@/utils/toast";
import IconComponent from "@/Components/IconComponent";
import axios from "axios";
import AuthHeaderComponent from "../../../Components/Tenant/Addons/AuthHeaderComponent";

/**
 * @component
 * RegistrationVerifyPage Component
 *
 * @description
 * Handles the email verification step during tenant registration.
 * Displays an OTP input form when an email is provided; otherwise shows
 * a helper message prompting the user to complete registration.
 *
 * @param {Object} props
 * @param {string} [props.email=""] - The email address used for verification.
 *
 * @returns {JSX.Element} The rendered email verification page.
 *
 * @example <RegistrationVerifyPage email="user@example.com" />
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */

export default function RegistrationVerifyPage() {
    const route = useRoute();
    const __ = useTranslations();
    const { toastAlert, routeNames, tenantInputs } = usePage().props;

    const metaTitle = __("Verify your email");

    /** Extract tenant create inputs */
    const { email = "", password = "", company = "" } = tenantInputs;

    /** Memoized Joi schema */
    const schema = useMemo(() => TenantEmailVerifySchema(__), [__]);

    /** Form state */
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
        email: email || "",
        model: "App\\Models\\Tenant",
    });

    const [resending, setResending] = useState(false);

    /** Submit verification form */
    const handleSubmit = (e) => {
        e.preventDefault();
        const { error } = schema.validate(
            { verifyToken: data.verifyToken, email: data.email },
            { abortEarly: false }
        );
        if (error) {
            const joiErrors = {};
            error.details.forEach((detail) => {
                joiErrors[detail.path[0]] = detail.message;
            });
            clearErrors();
            setError(joiErrors);
            swalToast({ type: "error", message: __("Invalid token") });
            return;
        }
        if (!routeNames?.verifyProcess) return;
        post(route(routeNames.verifyProcess), { preserveScroll: true });
    };

    /** Resend OTP */
    const handleResend = (e) => {
        e.preventDefault();
        setResending(true);
        post(route(routeNames.resendVerifyToken), {
            preserveScroll: true,
            onFinish: () => setResending(false),
        });
    };

    /** Show toast notifications */
    useEffect(() => {
        if (toastAlert?.message)
            swalToast({ ...toastAlert, message: __([toastAlert.message]) });
    }, [toastAlert]);

    /** Call for tenant registration process */
    useEffect(() => {
        /* Only proceed if we have tenant inputs */
        if (!tenantInputs || Object.keys(tenantInputs).length === 0) return;

        const registerTenant = async () => {
            try {
                const response = await axios.post(
                    route("tenant.register.new.tenant"),
                    tenantInputs,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            "X-Requested-With": "XMLHttpRequest",
                        },
                    }
                );

                /* Handle successful response */
                if (response.status >= 200 && response.status < 300) {
                    /* Do something */
                }
            } catch (error) {
                /* Do something */
            }
        };

        registerTenant();
    }, [tenantInputs]);

    return (
        <AuthLayout metaTitle={metaTitle}>
            <main className="space-y-6">
                {email ? (
                    <form
                        onSubmit={handleSubmit}
                        noValidate
                        className="space-y-3"
                    >
                        {/* Header */}
                        <AuthHeaderComponent title={__("Verify your account")}>
                            <p className="text-sm text-secondary/90 leading-5">
                                {__(
                                    "We've sent a verification email to your inbox. Please check your email, and be sure to look in your spam folder if you don't see it"
                                )}
                            </p>
                        </AuthHeaderComponent>

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
                                "Enter the otp received by email in the input box below"
                            )}
                            <br />
                            <span className="font-semibold italic text-xl text-base-300/50">
                                {email}
                            </span>
                        </p>

                        {/* Input Fields */}
                        <fieldset>
                            <legend className="sr-only">
                                {__("OTP Verification")}
                            </legend>
                            {TenantGlobalRegistrationVerify.map((field) => (
                                <AuthFormInputComponent
                                    key={field.name}
                                    field={field}
                                    data={data}
                                    errors={errors}
                                    setData={setData}
                                />
                            ))}
                        </fieldset>

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
                                        <>{__("Verify and continue")}</>
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
                    /** Show when email is empty */
                    <div className="text-center space-y-8">
                        <IconComponent
                            icon="followup2"
                            classList="text-8xl text-brandColor/70 mx-auto"
                        />

                        <div className="alert alert-warning alert-soft alert-vertical sm:alert-horizontal bg-base-200">
                            <IconComponent icon="info" classList="text-2xl" />
                            <div className=" text-brandColor">
                                <h3 className="font-bold text-xl">
                                    {__("Oops")}
                                </h3>
                                <div className="text-sm">
                                    {__(
                                        "It looks like you don't have an account yet. Please complete the registration process before attempting to log in"
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

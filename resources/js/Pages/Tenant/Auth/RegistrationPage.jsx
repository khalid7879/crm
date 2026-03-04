import React, { useEffect, useMemo } from "react";
import { useForm, usePage, Link } from "@inertiajs/react";
import { useRoute } from "ziggy";
import TermsOfServiceAcknowledgeComponent from "@/Components/Tenant/Addons/TermsOfServiceAcknowledgeComponent";
import AuthLayout from "@/Components/Tenant/AuthLayout";
import AuthFormInputComponent from "@/Components/Tenant/Forms/AuthFormInputComponent";
import { useTranslations } from "@/hooks/useTranslations";
import { TenantRegisterSchema } from "@/schemas/tenants/tenantSchema";
import { TenantGlobalRegistrationFormStep1 } from "@/utils/inputs";
import { swalToast } from "@/utils/toast";
import IconComponent from "@/Components/IconComponent";
import AuthHeaderComponent from "@/Components/Tenant/Addons/AuthHeaderComponent";

/**
 * @component
 * RegistrationPage Component
 *
 * @description
 * Handles the full tenant registration workflow including:
 * - Rendering the registration form inside the `AuthLayout`
 * - Joi schema validation using `TenantRegisterSchema`
 * - Controlled form handling with Inertia's `useForm`
 * - Displaying real-time validation errors
 * - Acknowledgment of Terms of Service
 * - Toast notifications for backend alerts and validation feedback
 * - Google OAuth button (coming soon)
 *
 * The component uses memoized validation schema, dynamic form fields from
 * `TenantGlobalRegistrationFormStep1`, and integrates with Inertia.js routing.
 *
 * @param {Object} props - Component props.
 * @param {Record<string, string>} props.routeNames - Contains Inertia route names for login and registration store routes.
 *
 * @returns {JSX.Element} The rendered tenant registration page.
 *
 * @example
 * <RegistrationPage
 *     routeNames={{
 *         store: "tenant.register.store",
 *         login: "tenant.login"
 *     }}
 * />
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function RegistrationPage() {
    const __ = useTranslations();
    const { toastAlert, staticImages, routeNames } = usePage().props;

    /** Memoized Joi validation schema to prevent re-creation on re-render */
    const schema = useMemo(() => TenantRegisterSchema(__), []);

    const route = useRoute();
    const metaTitle = __("Register");

    /** Initialize form state and helpers */
    const { data, setData, post, processing, errors, setError, clearErrors } =
        useForm({
            email: "",
            password: "",
            company: "",
            // email: "user@ihelpkl.com",
            // password: "Sadmin2025#",
            // company: "iHelp KL",
        });

    /** Handle form submit with validation before posting */
    const handleSubmit = (e) => {
        e.preventDefault();
        clearErrors();

        const { error } = schema.validate(
            {
                email: data.email,
                password: data.password,
                company: data.company,
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
            swalToast({
                type: "error",
                message: __(
                    "Please review and update the required fields to finish signing up"
                ),
                position: "top-start",
            });
            return;
        }

        clearErrors();
        post(route(routeNames.tenantStore), {
            preserveScroll: true,
            onSuccess: (result) => {
                // console.log("register result:", result);
            },
        });
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
        <AuthLayout
            metaTitle={metaTitle}
            isRTL={true}
            innerTitle="Grow your pipeline, not your expenses"
            innerSubTitle="Explore everything without credit card"
            innerInfo="Simple to use. Easy to afford"
            innerImg={staticImages?.bgLeadInfo}
        >
            <form onSubmit={handleSubmit} noValidate>
                {/* Registration input fields section */}
                <section className="space-y-6 transition-all duration-300">
                    <AuthHeaderComponent
                        title={__("Register yourself")}
                    ></AuthHeaderComponent>

                    <fieldset className="space-y-5">
                        <legend className="sr-only">
                            {__("Account information")}
                        </legend>

                        {TenantGlobalRegistrationFormStep1.map((field) => (
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

                {/* Terms of service acknowledgment */}
                <article>
                    <TermsOfServiceAcknowledgeComponent />
                </article>

                {/* Submit button and login link */}
                <footer>
                    <button
                        type="submit"
                        disabled={processing}
                        className={`mt-3 cursor-pointer w-full h-9 text-white font-bold text-lg transition-all duration-300 shadow-lg  ${
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
                            <>{__("Sign up")}</>
                        )}
                    </button>

                    <button
                        onClick={() => {
                            swalToast({
                                type: "info",
                                message: __("Coming soon"),
                            });
                        }}
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
                            href={route(routeNames.forgetPassword)}
                            className="text-gray-700 font-semibold hover:underline"
                        >
                            {__("Forgot password")}
                        </Link>
                    </p>
                </footer>
            </form>
        </AuthLayout>
    );
}

import React from "react";
import TenantDashboardLayout from "@/Components/Tenant/TenantDashboardLayout";
import { useTranslations } from "@/hooks/useTranslations";

/**
 * @component TenantErrorPage
 * @description A visually enhanced error page component for tenant dashboard, displaying customized error messages, descriptions, and icons based on HTTP status codes. Utilizes daisyUI 5 components (hero, card, alert) for a modern, attractive, and responsive design.
 *
 * Features:
 * - Centered full-screen hero section with dynamic background color
 * - Large illustrative SVG icon for each error type
 * - Bold error title and descriptive message with translation support
 * - Optional "Go Back Home" button for better UX (can be customized further)
 * - Fallback to 404 for unknown status codes
 *
 * @param {Object} props
 * @param {number|string} props.status - The HTTP status code (e.g., 404, 500, 503, 403)
 *
 * @example
 * // Usage in a route or page
 * <TenantErrorPage status={404} />
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author Mamun <mamunhossen149191@gmail.com>
 */
export default function TenantErrorPage({ status }) {
    const __ = useTranslations();

    /* Error configuration objects for easy maintenance */
    const errorConfig = {
        titles: {
            503: "503 service unavailable",
            500: "500 server error",
            404: "404 page not found",
            403: "403 forbidden",
        },
        descriptions: {
            503: "Sorry, we are doing some maintenance. Please check back soon",
            500: "Whoops, something went wrong on our servers",
            404: "Sorry, the page you are looking for could not be found",
            403: "Sorry, you are forbidden from accessing this page",
        },
        icons: {
            503: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-current w-24 h-24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6V4m-2 2h4m-6 6h12m-8 6h4m-8-6v8m4-8v8"
                    />
                </svg>
            ),
            500: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-current w-24 h-24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>
            ),
            404: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-current w-24 h-24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
            ),
            403: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-current w-24 h-24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                </svg>
            ),
        },
        alertVariants: {
            503: "alert-info",
            500: "alert-error",
            404: "alert-warning",
            403: "alert-error",
        },
    };

    /* Fallback to 404 if status is unknown */
    const effectiveStatus = [503, 500, 404, 403].includes(Number(status))
        ? status
        : 404;

    const title = errorConfig.titles[effectiveStatus];
    const description = errorConfig.descriptions[effectiveStatus];
    const icon = errorConfig.icons[effectiveStatus];
    const alertClass = errorConfig.alertVariants[effectiveStatus];

    return (
        <TenantDashboardLayout metaTitle={title}>
            <section className="hero bg-base-100">
                <div className="hero-content text-center">
                    <div className="max-w-md">
                        <div className="flex justify-center mb-8 text-primary">
                            {icon}
                        </div>

                        <h1 className="text-5xl font-bold mb-4">{__(title)}</h1>

                        <div
                            role="alert"
                            className={`alert ${alertClass} shadow-lg mb-8`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                className="stroke-current shrink-0 w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                ></path>
                            </svg>
                            <span>{__(description)}</span>
                        </div>
                    </div>
                </div>
            </section>
        </TenantDashboardLayout>
    );
}

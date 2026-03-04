import React from "react";
import { useTranslations } from "@/hooks/useTranslations";
import IconComponent from "@/Components/IconComponent";
import { Link } from "@inertiajs/react";

/**
 * @component CommonWebErrorPage
 * @description A reusable, user-friendly error page component built with DaisyUI styling.
 * Displays customized title, description, icon, and background based on common HTTP error status codes.
 * Supports internationalization via the useTranslations hook and includes a prominent "Go home" button.
 *
 * Supported status codes: 404 (default), 500, 503, 403.
 *
 * @param {Object} props - Component props
 * @param {number} [props.status=404] - HTTP status code to determine error content (404, 500, 503, 403)
 * @returns {JSX.Element} Responsive centered error card with icon, message, action button and footer
 *
 * @import CommonWebErrorPage from "@/Pages/Errors/CommonWebErrorPage"
 * 
 * @example
 * <CommonWebErrorPage />
 * <CommonWebErrorPage status={500} />
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function CommonWebErrorPage({ status = 404 }) {
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
            503: "setting",
            500: "server",
            404: "search",
            403: "lock",
        },
        bgColors: {
            503: "bg-brandColor",
            500: "bg-error",
            404: "bg-brandColor",
            403: "bg-brandColor",
        },
    };

    /* Fallback to 404 if status is unknown */
    const metaTitle = errorConfig.titles[status] || errorConfig.titles[404];
    const description =
        errorConfig.descriptions[status] || errorConfig.descriptions[404];
    const icon = errorConfig.icons[status] || errorConfig.icons[404];
    const bgColorClass =
        errorConfig.bgColors[status] || errorConfig.bgColors[404];

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-100 p-4">
            <div className="card w-full max-w-md shadow-2xl bg-base-200">
                <div
                    className={`card-body text-center p-8 ${bgColorClass} bg-opacity-10 rounded-t-2xl`}
                >
                    {/* Error Icon */}
                    <div className="text-6xl mb-6 animate-pulse">
                        <IconComponent icon={icon} />
                    </div>

                    {/* Error Title */}
                    <h1 className="text-4xl font-bold mb-4 text-base-content">
                        {__(metaTitle)}
                    </h1>

                    {/* Error Description */}
                    <div className="text-lg text-base-content mb-8">
                        {__(description)}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                        <Link href="/" className="btn btn-warning flex-1">
                            <IconComponent icon="home" classList="text-black" />
                            {__("Go home")}
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="card-footer bg-base-300 p-4 rounded-b-2xl">
                    <div className="text-center text-sm opacity-50">
                        <p>
                            © {new Date().getFullYear()} iHelpBD.{" "}
                            {__("All rights reserved")}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

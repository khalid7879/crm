import React, { useMemo } from "react";
import MetaData from "@/Components/Root/MetaData";
import { Link, usePage } from "@inertiajs/react";
import { useTranslations } from "@/hooks/useTranslations";
import LazyImageComponent from "@/Components/Common/LazyImageComponent";
import SeoImageComponent from "@/Components/Common/SeoImageComponent";

/**
 * @component
 * AuthLayout Component
 *
 * @description
 * A responsive two-column authentication layout used for Login/Register pages.
 * The left column displays the logo, form, and footer links.
 * The right column shows a promotional banner, subtitle, description, and image.
 * On mobile devices, only the left panel is visible.
 *
 * @param {Object} props                         - Component props.
 * @param {React.ReactNode} props.children       - The inner form/content section.
 * @param {string} [props.metaTitle="register"]  - Title used for page metadata.
 * @param {boolean} [props.isRTL=false]          - Enables right-to-left layout order.
 * @param {string} [props.innerTitle]            - Optional heading text on the right panel.
 * @param {string} [props.innerSubTitle]         - Optional subheading text on the right panel.
 * @param {string} [props.innerInfo]             - Optional description text for the right panel.
 * @param {string} [props.innerImg]              - Optional custom image shown on the right panel.
 *
 * @returns {JSX.Element} The rendered layout.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */

export default function AuthLayout({
    children,
    metaTitle = "register",
    isRTL = false,
    innerTitle = "",
    innerSubTitle = "",
    innerInfo = "",
    innerImg = "",
}) {
    const { staticImages } = usePage().props;
    const __ = useTranslations();

    const navItems = useMemo(
        () => [
            { name: __("Home"), routeName: "web.homepage" },
            { name: __("Privacy"), routeName: "web.homepage" },
            { name: __("Terms"), routeName: "web.homepage" },
        ],
        [__]
    );

    return (
        <div className="h-screen grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
            <MetaData metaTitle={metaTitle} />

            {/** Left Panel — 1/4 width */}
            <aside
                className={`
        ${isRTL ? "order-2" : "order-1"}
        col-span-1 md:col-span-1 lg:col-span-2 
        h-full overflow-hidden flex flex-col items-center justify-center bg-white p-0
    `}
            >
                <div className="bg-white backdrop-blur-sm border border-white/40 w-full max-w-lg p-0 sm:p-8 rainbow">
                    {/** Logo Section */}
                    <header className="w-full flex items-center justify-center mb-2">
                        <div className="relative w-40 h-20">
                            <LazyImageComponent keys={["logo"]}>
                                {(images) => (
                                    <SeoImageComponent
                                        width="160"
                                        height="40"
                                        className="w-full h-auto"
                                        src={images?.logo?.src}
                                        alt={images?.logo?.alt || "Logo"}
                                        priority
                                    />
                                )}
                            </LazyImageComponent>
                        </div>
                    </header>

                    {/** Render Inner Form */}
                    <main className="p-3 md:p-0">{children}</main>

                    {/** Footer Navigation */}
                    <ul className="flex justify-center gap-2 mt-3 text-[8px]">
                        {navItems.map((item, index) => (
                            <li key={index}>
                                <Link
                                    href={route(item.routeName)}
                                    className="hover:underline text-gray-500 text-xs"
                                >
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>

            {/** Right Panel — 3/4 width */}
            <aside
                className={`
        ${isRTL ? "order-1" : "order-2"}
        col-span-1 md:col-span-1 lg:col-span-5  
        hidden md:block relative w-full h-full md:p-3 lg:p-0
    `}
                id="rightSection"
            >
                {/** Full Background Image */}
                <div
                    className="absolute inset-0 w-full h-full bg-cover bg-lef bg-no-repeat"
                    style={{
                        backgroundImage: `url(${staticImages?.bgAuth})`,
                    }}
                ></div>

                {/** Dark Overlay */}
                <div className="absolute inset-0 bg-black/85"></div>

                {/** Center Content */}
                <div className="relative z-10 flex items-center justify-center h-full">
                    <div className="bg-white p-3 md:p-10 rounded-md shadow-xl max-w-xl w-md md:w-full text-center">
                        <h5 className="text-md font-semibold text-brandColor mb-3 tracking-wider uppercase">
                            {innerTitle
                                ? __(innerTitle)
                                : __("Say goodbye to manual data entry")}
                        </h5>
                        <h2 className="text-2xl font-bold text-gray-700 mb-3">
                            {innerSubTitle
                                ? __(innerSubTitle)
                                : __("Let your crm work for you")}
                        </h2>
                        <p className="text-sm text-gray-500 max-w-sm mx-auto mb-3">
                            {innerInfo
                                ? __(innerInfo)
                                : __(
                                      "With our form builder, collecting customer info is effortless"
                                  )}
                        </p>

                        <div className="relative w-full overflow-hidden rounded-md ">
                            <div className="relative w-full aspect-[3/2] md:aspect-[1200/800]">
                                <LazyImageComponent keys={["authInner"]}>
                                    {() => (
                                        <SeoImageComponent
                                            width=""
                                            height=""
                                            className="w-full h-full object-contain transition-opacity duration-300"
                                            src={
                                                innerImg || staticImages?.bgTask
                                            }
                                            alt="banner"
                                        />
                                    )}
                                </LazyImageComponent>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}

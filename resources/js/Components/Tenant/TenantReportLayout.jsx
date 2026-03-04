import React from "react";
import TenantRootLayout from "@/Components/Tenant/TenantRootLayout";
import SettingsSidebar from "@/Components/Tenant/Partials/SettingsSidebar";
import MetaData from "@/Components/Root/MetaData";
import "@css/custom-scroll.css";
import { reportSidebarNavItems } from "@/utils/nav/reportNavItems.js";

/**
 * TenantReportLayout Component
 *
 * @component
 * @description
 * A layout wrapper for all tenant reporting pages.
 * Renders a fixed left sidebar with report navigation links and a right-side
 * content area for the active report page. Includes metadata handling for SEO.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The main content to render inside the layout.
 * @param {string} [props.className="w-full rounded-2xl box-con"] - Additional Tailwind classes for the right content panel.
 * @param {string} [props.metaKeywords=""] - Meta keyword tags for the page.
 * @param {string} [props.metaDescription=""] - Meta description tag for the page.
 * @param {string} [props.metaTitle=""] - Title used in `<head>` metadata.
 *
 * @returns {JSX.Element} The rendered tenant report layout with sidebar navigation.
 *
 * @example
 * <TenantReportLayout metaTitle="Lead Report">
 *     <LeadReportPage />
 * </TenantReportLayout>
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function TenantReportLayout({
    children,
    className = "w-full rounded-2xl box-con",
    metaKeywords = "",
    metaDescription = "",
    metaTitle = "",
}) {
    return (
        <TenantRootLayout>
            <MetaData
                metaTitle={metaTitle}
                metaDescription={metaDescription}
                metaKeywords={metaKeywords}
            />
            <div className="flex w-full gap-2">
                {/* Fixed left panel */}
                <div className="w-full md:w-40 h-full md:fixed top-[4rem] z-10 overflow-y-auto border-r border-base-300 bg-base-100 scrollbar-thin-scrollbar">
                    <SettingsSidebar
                        navItems={reportSidebarNavItems}
                        showNavIcon={true}
                        isReportSidebar={true}
                    />
                </div>

                {/* Right panel */}
                <div className={`flex-1 pt-1 ${className} ml-40`}>
                    {children}
                </div>
            </div>
        </TenantRootLayout>
    );
}

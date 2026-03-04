import React from "react";
import TenantRootLayout from "@/Components/Tenant/TenantRootLayout";
import SettingsSidebar from "@/Components/Tenant/Partials/SettingsSidebar";
import MetaData from "@/Components/Root/MetaData";
import "@css/custom-scroll.css";
import { navItems } from "@/utils/nav/navItems.js";

/**
 * TenantSettingLayout - A responsive layout wrapper for tenant settings pages.
 *
 * Provides a two-column layout on desktop (≥768px):
 * - A narrow inner sidebar (settings navigation) on the left
 * - Main content area on the right
 *
 * On mobile (<768px), it switches to a stacked vertical layout:
 * - Inner sidebar at the top (full width)
 * - Main content below
 *
 * Respects the outer fixed sidebar (width-40 / 10rem) from TenantRootLayout
 * by offsetting the entire inner layout with `md:left-40`.
 *
 * Features:
 * - Independent vertical scrolling on desktop (shared feel via single scrollbar)
 * - No horizontal scrollbar on sidebar
 * - Fully responsive and mobile-friendly
 * - Clean separation between desktop (fixed) and mobile (flow) layouts
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The main content to render in the primary panel
 * @param {string} [props.className="w-full rounded-2xl box-con"] - Additional classes for the inner content wrapper
 * @param {string} [props.metaTitle=""] - Page title for <title> tag and browser tab
 * @param {string} [props.metaDescription=""] - Meta description for SEO
 * @param {string} [props.metaKeywords=""] - Meta keywords for SEO (optional/modern usage limited)
 *
 * @returns {JSX.Element} The complete settings layout with sidebar and responsive behavior
 *
 * @example
 * <TenantSettingLayout metaTitle="Users">
 *   <UserListPage />
 * </TenantSettingLayout>
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function TenantSettingLayout({
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

            {/* Desktop Layout: Fixed side-by-side (starts after outer sidebar) */}
            <div className="fixed inset-0 top-12 md:left-40 md:flex hidden">
                {/* Inner Settings Sidebar - Visible only on md+ screens */}
                <aside className="hidden md:block w-64 md:w-48 flex-shrink-0 border-r border-base-300 bg-base-100 overflow-hidden pl-1">
                    <div className="p-3 h-full overflow-y-auto scrollbar-thin-scrollbar">
                        <SettingsSidebar navItems={navItems} />
                    </div>
                </aside>

                {/* Main Content Area - Takes remaining space */}
                <main className="flex-1 overflow-scroll bg-transparent dataManagementScrollbar">
                    <div className={`py-3 ${className}`}>{children}</div>
                </main>
            </div>

            {/* Mobile Layout: Stacked vertically in normal document flow */}
            <div className="md:hidden flex flex-col min-h-screen pt-12">
                {/* Mobile Sidebar - Full width, limited height to avoid dominating screen */}
                <aside className="w-full border-b border-base-300 bg-base-100">
                    <div className="p-3 overflow-y-auto scrollbar-thin-scrollbar max-h-60">
                        <SettingsSidebar navItems={navItems} />
                    </div>
                </aside>

                {/* Mobile Main Content */}
                <main className="flex-1 bg-transparent">
                    <div className={`py-3 px-4 ${className}`}>{children}</div>
                </main>
            </div>
        </TenantRootLayout>
    );
}

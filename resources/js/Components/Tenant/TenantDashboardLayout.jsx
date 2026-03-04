import React from "react";
import TenantRootLayout from "@/Components/Tenant/TenantRootLayout";
import MetaData from "@/Components/Root/MetaData";
import Breadcrumb from "@/Components/Tenant/PageComponent/BreadcrumbComponent";
import { useTranslations } from "@/hooks/useTranslations";

/***
 * TenantDashboardLayout
 * ----------------------
 * Main wrapper for tenant dashboard pages.
 * Provides global structure, SEO meta data, and optional breadcrumb navigation.
 *
 * @component
 * @param {object} props
 * @param {React.ReactNode} props.children - Inner page content to render.
 * @param {string} [props.metaTitle=""] - Page title used in metadata and breadcrumb.
 * @param {string} [props.metaDescription=""] - SEO description.
 * @param {string} [props.metaKeywords=""] - SEO keywords.
 * @param {Array<{ label: string, href?: string }>} [props.breadNavItems=[]] - Optional breadcrumb items.
 *
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 ***/
export default function TenantDashboardLayout({
    children,
    metaKeywords = "",
    metaDescription = "",
    metaTitle = "",
    breadNavItems = [],
    isShowListPageActionBtns = false,
    listPageActionButtons = [],
}) {
    const __ = useTranslations();

    return (
        <TenantRootLayout>
            {/* SEO Meta */}
            <MetaData
                metaTitle={metaTitle}
                metaDescription={metaDescription}
                metaKeywords={metaKeywords}
            />
            {breadNavItems.length > 0 && (
                <Breadcrumb
                    title={metaTitle ? __(metaTitle) : __("default")}
                    navItems={breadNavItems}
                    isShowListPageActionBtns={isShowListPageActionBtns}
                    listPageActionButtons={listPageActionButtons}
                ></Breadcrumb>
            )}
            <div className="p-2">{children}</div>
        </TenantRootLayout>
    );
}

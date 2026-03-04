import React from "react";
import { Link, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";
import TenantReportLayout from "@/Components/Tenant/TenantReportLayout";
import Breadcrumb from "@/Components/Tenant/PageComponent/BreadcrumbComponent";
import { useTranslations } from "@/hooks/useTranslations";
import { BusinessSettingsBreadItems } from "@/utils/common/BreadcrumbNavItems";
import TableContainer from "@/Components/Tenant/Tables/TableContainer";
import TableHeadComponent from "@/Components/Tenant/Tables/TableHeadComponent";
import TableBodyComponent from "@/Components/Tenant/Tables/TableBodyComponent";
import TableTrComponent from "@/Components/Tenant/Tables/TableTrComponent";
import TableCell from "@/Components/Tenant/Tables/TableCell";
import IconComponent from "@/Components/IconComponent";
import { reportNavItems } from "@/utils/nav/reportNavItems.js";

/**
 * ReportPage Component
 *
 * @module Components/Tenant/Reports/ReportPage
 * @description
 * Main report listing page that displays all available reports in a structured table format.
 * This component renders a hierarchical view of report categories and individual reports,
 * filtering based on user permissions and providing navigation links to specific reports.
 *
 * @component
 * @requires react
 * @requires @inertiajs/react - For client-side routing and page props
 * @requires ziggy - For named route generation
 * @requires @/Components/Tenant/TenantReportLayout - Layout wrapper for report pages
 * @requires @/hooks/useTranslations - For internationalization support
 * @requires @/utils/nav/reportNavItems.js - Data source for report navigation items
 * @returns {JSX.Element} Rendered report listing page with breadcrumb navigation
 *
 * @typedef {Object} ReportNavItem
 * @property {string} label - Display name of the report or category
 * @property {string} [icon] - Icon identifier for parent categories
 * @property {string} link - Route name for navigation (for child items)
 * @property {boolean} isParent - Whether this item is a category/group
 * @property {string} [permission] - Required permission to view this item
 *
 * @typedef {Object} PageProps
 * @property {Object} auth - Authentication information
 * @property {Array<string>} authPermissions - User's permission array
 * @property {Object} tenant - Current tenant information
 *
 * @see {@link usePage} from @inertiajs/react for page props access
 * @see {@link useTranslations} for internationalization
 * @see {@link reportNavItems} for report data structure
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function ReportPage() {
    const { authPermissions, tenant } = usePage().props;
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Advanced reporting");

    return (
        <TenantReportLayout metaTitle={metaTitle}>
            <Breadcrumb
                title={metaTitle}
                navItems={[...BusinessSettingsBreadItems]}
            />

            <TableContainer>
                {/* Table Head */}
                <TableHeadComponent>
                    <TableCell width="40%" data={__("Name")} as="th" />
                    <TableCell width="20%" data={__("Created by")} as="th" />
                </TableHeadComponent>

                {/* Table Body */}
                <TableBodyComponent>
                    {reportNavItems(authPermissions).map((item, idx) => (
                        <TableTrComponent key={idx}>
                            {/* Label + Icon */}
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    {item.icon && item.isParent && (
                                        <IconComponent
                                            icon={item.icon}
                                            classList="w-5 h-5 text-brandColor"
                                        />
                                    )}
                                    {!item.isParent && (
                                        <IconComponent
                                            icon="arrowRight"
                                            classList="w-6 h-6 text-base-content"
                                        />
                                    )}
                                    <span
                                        className={
                                            item.isParent
                                                ? "font-bold text-gray-500 text-lg"
                                                : ""
                                        }
                                    >
                                        {item.isParent ? (
                                            <>{__(item.label)}</>
                                        ) : (
                                            <Link
                                                href={route(item.link, {
                                                    tenant,
                                                })}
                                                className="hover:underline"
                                            >
                                                {__(item.label)}
                                            </Link>
                                        )}
                                    </span>
                                </div>
                            </TableCell>

                            {/* Creator (Parent rows blank) */}
                            <TableCell>{__("System")}</TableCell>
                        </TableTrComponent>
                    ))}
                </TableBodyComponent>
            </TableContainer>
        </TenantReportLayout>
    );
}

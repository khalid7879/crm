import React, { useMemo } from "react";
import { Link, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";
import { useTranslations } from "@/hooks/useTranslations";
import IconComponent from "@/Components/IconComponent";

export default function SettingsSidebar({
    navItems,
    showNavIcon = true,
    isReportSidebar = false,
}) {
    const { tenant, authPermissions } = usePage().props;
    const __ = useTranslations();
    const route = useRoute();

    const settingSidebarNavItems = useMemo(
        () => navItems(authPermissions),
        [authPermissions]
    );

    return (
        <div className="p-2 font-DMSans h-full max-h-[calc(100vh-70px)] overflow-y-auto scrollbar-hide hover:scrollbar-show transition-all duration-300 bg-base-100">
            {/* Search Input */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder={__("Search here")}
                    className="w-full px-4 py-2 text-sm border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandColor/50 focus:border-transparent placeholder:text-base-content/60 bg-base-100 text-base-content"
                />
            </div>

            {/* Navigation */}
            <div className="mb-2">
                <ul className="space-y-1">
                    {settingSidebarNavItems.map((item, index) => {
                        if (item.isParent) {
                            return (
                                <li
                                    key={`settings_inner_nav_item_${index}`}
                                    className="text-[10px] tracking-wide uppercase font-bold text-base-content/60 mt-4 font-sans"
                                >
                                    {__(item.label)}
                                </li>
                            );
                        }
                        let isActive = null;
                        const routePrefix = item.link.replace(/\.index$/, "");
                        if (!isReportSidebar) {
                            isActive =
                                route().current(item.link) ||
                                route().current(`${routePrefix}.*`);
                        } else {
                            isActive = false;
                        }                        

                        return (
                            <li key={`settings_inner_nav_item_${index}`}>
                                <Link
                                    href={route(item.link, {
                                        tenant,
                                        ...item?.linkParams,
                                    })}
                                    className={`flex items-center gap-2 px-2 py-0.5 rounded-md text-xs font-medium transition-colors duration-200 ${
                                        isActive
                                            ? "bg-base-200 text-brandColor font-semibold"
                                            : "text-base-content hover:bg-base-200 hover:text-brandColor"
                                    }`}
                                >
                                    {showNavIcon && (
                                        <IconComponent
                                            icon={item.icon}
                                            classList={`text-[12px] ${
                                                isActive
                                                    ? "text-brandColor"
                                                    : ""
                                            }`}
                                        />
                                    )}
                                    {__(item.label)}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}

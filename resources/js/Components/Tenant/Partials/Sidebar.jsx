import React, { useEffect, useMemo } from "react";
import { usePage, Link } from "@inertiajs/react";
import { useRoute } from "ziggy";
import IconComponent from "@/Components/IconComponent";
import ToggleButtonComponent from "@/Components/Tenant/Buttons/ToggleButtonComponent";
import { useTranslations } from "@/hooks/useTranslations";
import { sidebarNavItems } from "@/utils/nav/sidebarNavItems.js";

/**
 * SidebarComponent
 *
 * Responsive sidebar navigation for the tenant dashboard.
 * Automatically collapses on smaller screens and highlights
 * the currently active section (e.g., leads, tasks, projects).
 *
 * @component
 * @example
 * <SidebarComponent
 *    collapsed={collapsed}
 *    toggleSidebar={toggleSidebar}
 *    setCollapsed={setCollapsed}
 * />
 *
 * @param {Object} props - Component props.
 * @param {boolean} props.collapsed - Whether the sidebar is collapsed.
 * @param {Function} props.toggleSidebar - Toggles the sidebar visibility.
 * @param {Function} props.setCollapsed - Sets the collapsed state directly.
 *
 * @returns {JSX.Element} The rendered sidebar navigation.
 *
 * @author
 * Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function SidebarComponent({
    collapsed,
    toggleSidebar,
    setCollapsed,
}) {
    const { tenant } = usePage().props;
    const route = useRoute();
    const __ = useTranslations();

    /** Collapse sidebar automatically on small screens */
    useEffect(() => {
        const handleResize = () => setCollapsed(window.innerWidth < 640);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [setCollapsed]);

    /** Cached sidebar items */
    const navItems = useMemo(() => sidebarNavItems(), []);

    /** Detect current path and extract the active section key */
    const currentPath = window.location.pathname.toLowerCase();
    const activeKey = currentPath.split("/")[2] || "";

    return (
        <nav
            id="sidebar"
            className={`
                fixed top-11 md:top-14 left-0 h-screen bg-base-100 z-20
                transition-all duration-300 ease-in-out font-DMSans
                ${collapsed ? "w-16" : "w-44"}
            `}
        >
            {/* Sidebar Toggle Button */}
            <ToggleButtonComponent onClick={toggleSidebar} />

            {/* Navigation Links */}
            <ul className="flex flex-col mt-0 px-0">
                {navItems.map((item) => {
                    const href = route(item.routeName, { tenant });
                    const isActive =
                        currentPath.includes(`/${item.key}`) ||
                        activeKey === item.key;

                    return (
                        <li key={item.key} className="w-full my-1">
                            <Link
                                href={href}
                                className={`
                        group relative flex items-center gap-3 px-2 py-1 w-full
                        transition-colors duration-300
                        ${
                            isActive
                                ? "bg-base-300 text-brandColor rounded-md"
                                : "bg-base-100 text-base-content hover:bg-base-200 hover:text-brandColor"
                        }
                        ${collapsed ? "justify-center" : "justify-start"}
                    `}
                            >
                                {/* Icon */}
                                <IconComponent
                                    icon={item.icon || "user"}
                                    classList={`text-2xl transition-all duration-300 ${
                                        isActive
                                            ? "text-brandColor"
                                            : "text-base-content"
                                    }`}
                                />

                                {/* Label (when expanded) */}
                                {!collapsed && (
                                    <span className="text-md">
                                        {__(item.label)}
                                    </span>
                                )}

                                {/* Tooltip (when collapsed) */}
                                {collapsed && (
                                    <span
                                        className="
                                absolute left-full top-1/2 -translate-y-1/2 ml-2
                                hidden group-hover:inline-block
                                whitespace-nowrap px-2 py-1
                                text-sm rounded-md shadow
                                bg-base-200 text-base-content
                                z-50
                            "
                                    >
                                        {__(item.label)}
                                    </span>
                                )}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

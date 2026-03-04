import React, { useMemo } from "react";
import { Link, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";
import { useTranslations } from "@/hooks/useTranslations";
import IconComponent from "@/Components/IconComponent";
import { searchNavItems } from "@/utils/nav/searchNavItems.js";

export default function SearchSidebar() {
    const { tenant } = usePage().props;
    const __ = useTranslations();
    const route = useRoute();

    {
        /*  Call the function to get the actual array */
    }
    const navItems = searchNavItems();

    console.log("navItems", navItems);

    return (
        <div className="p-2 font-DMSans h-full max-h-[calc(100vh-70px)] overflow-y-auto scrollbar-hide hover:scrollbar-show transition-all duration-300 bg-base-100">
            {/* 🔍 Search Input */}
            {/* <div className="mb-4">
                <input
                    type="text"
                    placeholder={__("Search here")}
                    className="w-full px-4 py-2 text-sm border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandColor/50 focus:border-transparent placeholder:text-base-content/60 bg-base-100 text-base-content"
                />
            </div> */}

            {/* 📁 Navigation Items */}
            <div className="mb-2">
                <ul className="space-y-1">
                    {navItems.map((item, index) => {
                        const routePrefix = item.link.replace(/\.index$/, "");
                        const isActive =
                            route().current(item.link) ||
                            route().current(`${routePrefix}.*`);

                        return (
                            <li key={`search_nav_item_${index}`}>
                                <Link
                                    href={route(item.link, { tenant })}
                                    className={`flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium transition-colors duration-200 ${
                                        isActive
                                            ? "bg-base-200 text-brandColor font-semibold"
                                            : "text-base-content hover:bg-base-200 hover:text-brandColor"
                                    }`}
                                >
                                    <IconComponent
                                        icon={item.icon}
                                        classList={`text-[12px] ${
                                            isActive ? "text-brandColor" : ""
                                        }`}
                                    />
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

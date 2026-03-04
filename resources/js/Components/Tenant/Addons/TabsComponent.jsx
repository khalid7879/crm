import React, { useState, useEffect, useCallback } from "react";
import IconComponent from "@/Components/IconComponent";
import { useTranslations } from "@/hooks/useTranslations";
import LoadingSpinner from "@/Components/Tenant/Addons/LoadingSpinner";

/**
 * TabsComponent
 *
 * Optimized tab system with query param & defaultChecked support
 * - Syncs with `?tab=` query param
 * - Supports defaultChecked & defaultIndex fallback
 * - Updates URL without reload
 * - Handles back/forward browser navigation
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function TabsComponent({ tabs = [], defaultIndex = 0 }) {
    const __ = useTranslations();

    /** Get tab key from query string */
    const getTabFromQuery = () => {
        if (typeof window === "undefined") return null;
        return new URLSearchParams(window.location.search).get("tab");
    };

    /** Update the URL query param without reloading */
    const updateQueryParam = (tabKey) => {
        if (typeof window === "undefined") return;
        const url = new URL(window.location.href);
        url.searchParams.set("tab", tabKey);
        window.history.replaceState({}, "", url.toString());
    };

    /** Resolve initial active tab index */
    const getInitialIndex = useCallback(() => {
        /* Check query param */
        const queryTab = getTabFromQuery();
        if (queryTab) {
            const idx = tabs.findIndex(
                (t) => t.tabIndex === queryTab || t.id === queryTab
            );
            if (idx >= 0) return idx;
        }

        /* Check defaultChecked */
        const checkedIdx = tabs.findIndex((t) => t.defaultChecked);
        if (checkedIdx >= 0) {
            const tabKey = tabs[checkedIdx]?.tabIndex || tabs[checkedIdx]?.id;
            updateQueryParam(tabKey);
            return checkedIdx;
        }

        /* Fallback to defaultIndex */
        return defaultIndex;
    }, [tabs, defaultIndex]);

    const [activeIndex, setActiveIndex] = useState(getInitialIndex);
    const [loading, setLoading] = useState(false);

    /** Sync tab with query param on back/forward navigation */
    useEffect(() => {
        const handlePopState = () => {
            const queryTab = getTabFromQuery();
            if (!queryTab) return;
            const idx = tabs.findIndex(
                (t) => t.tabIndex === queryTab || t.id === queryTab
            );
            if (idx >= 0) setActiveIndex(idx);
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [tabs]);

    /** Handle tab click */
    const handleTabClick = (index, tabKey) => {
        if (index === activeIndex) return;

        setLoading(true);
        setTimeout(() => {
            setActiveIndex(index);
            setLoading(false);
        }, 200);

        updateQueryParam(tabKey);
    };

    return (
        <div>
            {/* Tab headers */}
            <div className="flex flex-col sm:flex-row justify-between lg:justify-start border-b border-base-300">
                {tabs.map((tab, index) => {
                    const tabKey = tab?.tabIndex || tab?.id || `tab-${index}`;
                    const isActive = activeIndex === index;

                    return (
                        <a
                            key={tabKey}
                            href="#"
                            data-tip={__(tab.label)}
                            onClick={(e) => {
                                e.preventDefault();
                                handleTabClick(index, tabKey);
                            }}
                            className={`tooltip flex md:flex-row items-center justify-start gap-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
                                isActive
                                    ? "border-brandColor text-brandColor"
                                    : "border-base-300 md:border-transparent text-base-content/60 hover:text-base-content hover:border-base-300"
                            }`}
                        >
                            <span className="me-1">
                                <IconComponent
                                    icon={tab?.icon ?? "info"}
                                    classList={`text-sm ${
                                        isActive
                                            ? "text-brandColor"
                                            : "text-base-content/60"
                                    }`}
                                />
                            </span>
                            <article className="indicator sm:hidden lg:block">
                                {__(tab.label)}
                                {/* {tab?.indicator && (
                                    <span className="indicator-item badge">
                                        {tab.indicator}
                                    </span>
                                )} */}
                            </article>
                        </a>
                    );
                })}
            </div>

            {/* Active tab content */}
            <div className="py-4 px-2 bg-base-100 border border-t-0 border-base-300 rounded-b-lg shadow-sm min-h-[100px]">
                {loading ? <LoadingSpinner /> : tabs[activeIndex]?.content}
            </div>
        </div>
    );
}

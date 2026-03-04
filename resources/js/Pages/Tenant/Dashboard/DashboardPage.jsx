import React, { useEffect, useState, useMemo } from "react";
import { usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";
import TenantDashboardLayout from "@/Components/Tenant/TenantDashboardLayout";
import { useTranslations } from "@/hooks/useTranslations";
import SingleChartCard from "@/Components/Tenant/Addons/SingleChartCard";
import DashboardChartNav from "@/Components/Tenant/Addons/DashboardChartNav";
import { getAlphabeticalColorName } from "@/utils/common/helpers";
import CreateAiDashboardCharts from "@/Components/Tenant/GraphsAndTrees/CreateAiDashboardCharts";

/**
 * DashboardPage Component
 * =============================================================
 * Controls all dashboard logic:
 *
 * Responsibilities
 * -------------------------------------------------------------
 * • Manage active insight
 * • Manage active chart color theme
 * • Sync insight to URL query ONLY (NOT to localStorage)
 * • Store color theme in localStorage
 * • Read defaultInsight only ONCE when initializing
 *
 * IMPORTANT CHANGE:
 * -------------------------------------------------------------
 * dashboard_default_insight is NO LONGER SET automatically.
 * It is set ONLY when user clicks "Mark as Default".
 *
 * @component
 * @author
 * Mamun Hossen
 * Sakil Jomadder <sakil.diu.cse@gmail.com>
 */

export default function DashboardPage() {
    const __ = useTranslations();
    const route = useRoute();
    const page = usePage();
    const { tenant, routeNames } = page.props;

    const colors = getAlphabeticalColorName([
        "violet",
        "indigo",
        "blue",
        "green",
        "yellow",
        "orange",
        "red",
        "coral",
        "hotpink",
        "silver",
        "ivory",
        "navy",
        "darkred",
        "coffee",
    ]);

    const LS_INSIGHT_DEFAULT_KEY = "dashboard_default_insight";
    const LS_COLOR_KEY = "dashboard_selected_color";

    /* ---------------------------------------------------------
     * Build insights list from backend
     * --------------------------------------------------------- */
    const insightsList = useMemo(() => {
        const charts = routeNames?.chartRoutes || {};
        return Object.values(charts).map((item) => ({
            key: item.key,
            label: item.label,
            icon: item.icon,
            route: item.route,
            type: item.type,
        }));
    }, [routeNames]);

    /* ---------------------------------------------------------
     * Initial load — READ ONLY
     * --------------------------------------------------------- */
    const urlInsight = new URLSearchParams(window.location.search).get(
        "dashboard"
    );
    const lsDefaultInsight = localStorage.getItem(LS_INSIGHT_DEFAULT_KEY);
    const lsColor = localStorage.getItem(LS_COLOR_KEY);

    const initialInsight =
        urlInsight || lsDefaultInsight || insightsList[0]?.key || null;

    const initialColor = lsColor || colors[0]?.hex || "#000000";

    /* ---------------------------------------------------------
     * React state
     * --------------------------------------------------------- */
    const [activeInsightKey, setActiveInsightKey] = useState(initialInsight);
    const [selectedColor, setSelectedColor] = useState(initialColor);

    const activeInsight = insightsList.find((i) => i.key === activeInsightKey);

    /* ---------------------------------------------------------
     * Sync INSIGHT to URL ONLY (NO LOCALSTORAGE)
     * --------------------------------------------------------- */
    useEffect(() => {
        const p = new URLSearchParams(window.location.search);
        p.set("dashboard", activeInsightKey);

        window.history.replaceState(
            {},
            "",
            `${window.location.pathname}?${p.toString()}`
        );

    }, [activeInsightKey]);

    /* ---------------------------------------------------------
     * Store COLOR in localStorage
     * --------------------------------------------------------- */
    useEffect(() => {
        localStorage.setItem(LS_COLOR_KEY, selectedColor);
    }, [selectedColor]);

    /* ---------------------------------------------------------
     * Render
     * --------------------------------------------------------- */
    return (
        <TenantDashboardLayout metaTitle={__("Dashboard")}>
            <DashboardChartNav
                insights={insightsList}
                selectedInsight={activeInsightKey}
                onChangeInsight={setActiveInsightKey}
                colors={colors}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
            />
            {activeInsightKey?.toLowerCase() === "aiinsight" &&
            !activeInsight ? (
                <>
                    <CreateAiDashboardCharts />
                </>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-3">
                    {activeInsight?.type?.map((graphType) => (
                        <div
                            key={`${activeInsight.key}-${graphType[0]}`}
                            className={`${graphType[1]} min-h-[250px]
                    bg-base-100 rounded-md border border-base-300
                    flex flex-col transition-transform duration-500
                    hover:border-brandColor/50 hover:bg-base-200`}
                        >
                            <SingleChartCard
                                routeUrl={route(activeInsight.route, {
                                    tenant,
                                    type: graphType[0],
                                })}
                                graphColor={selectedColor}
                            />
                        </div>
                    ))}
                </div>
            )}
        </TenantDashboardLayout>
    );
}

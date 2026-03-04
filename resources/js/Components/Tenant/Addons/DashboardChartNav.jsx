import React, { useMemo, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import IconComponent from "@/Components/IconComponent";
import { useTranslations } from "@/hooks/useTranslations";
import { motion, AnimatePresence } from "framer-motion";
import { swalToast } from "@/utils/toast";
import { capitalizeFirst } from "@/utils/common/helpers";
import { useRoute } from "ziggy";

/**
 * DashboardChartNav Component
 * -----------------------------------------------------------
 * Presentational navigation bar for dashboard insights.
 *
 * IMPORTANT CHANGE:
 * -----------------------------------------------------------
 * Does NOT modify dashboard_default_insight automatically.
 * It sets default ONLY when user clicks "Mark as Default".
 *
 * Props:
 * @param {Array} insights
 * @param {String} selectedInsight
 * @param {Function} onChangeInsight
 * @param {Array} colors
 * @param {String} selectedColor
 * @param {Function} setSelectedColor
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function DashboardChartNav({
    insights = [],
    selectedInsight,
    onChangeInsight,
    colors = [],
    selectedColor,
    setSelectedColor,
}) {
    const route = useRoute();
    const page = usePage();
    const { tenant, routeNames } = page.props;
    const __ = useTranslations();

    const DEFAULT_INSIGHT_KEY = "dashboard_default_insight";

    const [defaultInsightKey, setDefaultInsightKey] = useState(() => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem(DEFAULT_INSIGHT_KEY);
    });

    /* --------------------- Helpers --------------------- */
    const sortedColors = useMemo(
        () => [...colors].sort((a, b) => a.name.localeCompare(b.name)),
        [colors]
    );

    const selectedColorObj = colors.find((c) => c.hex === selectedColor);

    const currentIndex = insights.findIndex((i) => i.key === selectedInsight);

    /* --------------------- Navigation --------------------- */
    const goPrev = () => {
        if (!insights.length) return;
        const idx = (currentIndex - 1 + insights.length) % insights.length;
        onChangeInsight(insights[idx].key);
    };

    const goNext = () => {
        if (!insights.length) return;
        const idx = (currentIndex + 1) % insights.length;
        onChangeInsight(insights[idx].key);
    };

    const lightenHex = (hex, percent) => {
        const safeHex = (hex || "#000000").replace("#", "");
        const num = parseInt(safeHex, 16);
        const r = Math.min(255, ((num >> 16) & 0xff) + percent);
        const g = Math.min(255, ((num >> 8) & 0xff) + percent);
        const b = Math.min(255, (num & 0xff) + percent);
        return `rgb(${r},${g},${b})`;
    };

    /* --------------------- Set Default --------------------- */
    const handleSetDefault = () => {
        localStorage.setItem(DEFAULT_INSIGHT_KEY, selectedInsight);
        setDefaultInsightKey(selectedInsight);

        swalToast({
            type: "success",
            message: __("Default insight updated"),
        });
    };

    /* --------------------- Render --------------------- */
    return (
        <section className="flex flex-col lg:flex-row items-center justify-between border-b border-base-300 mb-3 pb-3 gap-3">
            {/* LEFT SIDE */}
            <aside className="flex items-center gap-2">
                {/* Mark as default */}
                <button
                    className="btn btn-sm tooltip tooltip-right tooltip-secondary"
                    data-tip={__("Mark as default dashboard")}
                    onClick={handleSetDefault}
                    type="button"
                >
                    <IconComponent
                        icon="success3"
                        classList="text-gray-500 w-6 h-6"
                    />
                </button>

                {/* Insight dropdown */}
                <article className="dropdown dropdown-hover min-w-44">
                    <label
                        tabIndex={0}
                        className="btn btn-sm m-1 w-full flex items-center justify-between"
                    >
                        {(() => {
                            const found = insights.find(
                                (i) => i.key === selectedInsight
                            );
                            return found
                                ? __(found.label)
                                : __("Select insight");
                        })()}

                        <IconComponent
                            icon="arrowDown"
                            classList="w-4 h-4 ml-1"
                        />
                    </label>

                    <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box min-w-72">
                        <AnimatePresence>
                            {insights.map((item) => (
                                <motion.li
                                    key={item.key}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                >
                                    <button
                                        type="button"
                                        className={`flex items-center gap-2 w-full px-2 py-1 rounded-md ${
                                            selectedInsight === item.key
                                                ? "active font-semibold"
                                                : "hover:bg-base-200"
                                        }`}
                                        onClick={() =>
                                            onChangeInsight(item.key)
                                        }
                                    >
                                        <IconComponent
                                            icon={item.icon}
                                            classList="w-4 h-4 ml-1"
                                        />
                                        <span>{__(item.label)}</span>

                                        {item.key === defaultInsightKey && (
                                            <span className="ml-auto text-brandColor text-xs">
                                                {__("Default")}
                                            </span>
                                        )}
                                    </button>
                                </motion.li>
                            ))}
                        </AnimatePresence>
                    </ul>
                </article>

                {/* Prev / Next */}
                {/* <nav className="flex items-center gap-1">
                    <span
                        className="tooltip tooltip-bottom tooltip-secondary mt-1"
                        data-tip={__("Previous insight")}
                    >
                        <IconComponent
                            icon="arrowChevronLeft"
                            classList="text-gray-300 cursor-pointer w-10 h-10"
                            callback={goPrev}
                        />
                    </span>

                    <span
                        className="tooltip tooltip-bottom tooltip-secondary mt-1"
                        data-tip={__("Next insight")}
                    >
                        <IconComponent
                            icon="arrowChevronRight"
                            classList="text-gray-300 cursor-pointer w-10 h-10"
                            callback={goNext}
                        />
                    </span>
                </nav> */}
            </aside>

            {/* RIGHT SIDE */}
            <aside className="flex items-center space-x-8">
                <Link
                    href={route(routeNames?.dashboard, {
                        tenant,
                        dashboard: "aiInsight",
                    })}
                    className="relative inline-flex tooltip tooltip-bottom tooltip-secondary "
                    data-tip={__("Ai dashboard")}
                >
                    {/* Main Icon */}
                    <IconComponent
                        icon="ai4"
                        classList="text-brandColor w-7 h-7"
                    />

                    {/* Superscript Icon */}
                    <IconComponent
                        icon="ai4"
                        classList="absolute -top-1 -right-1 text-brandColor w-4 h-4"
                    />
                </Link>

                <Link
                    className="tooltip tooltip-bottom tooltip-secondary mt-1"
                    data-tip={__("Create custom dashboard")}
                >
                    <IconComponent
                        icon="addChart"
                        classList={`text-[${selectedColor}] w-7 h-7`}
                    />
                </Link>

                {/* Current color */}
                {selectedColorObj && (
                    <motion.div className="flex items-center gap-2" layout>
                        <span
                            data-tip={capitalizeFirst(selectedColorObj?.name)}
                            // data-tip={"color name"}
                            className="inline-block rounded-full w-7 h-7 border-2 border-gray-200 shadow-sm tooltip tooltip-top tooltip-secondary"
                            style={{
                                backgroundColor: lightenHex(
                                    selectedColorObj.hex,
                                    40
                                ),
                            }}
                        />
                    </motion.div>
                )}

                {/* Color Picker */}
                <div className="dropdown dropdown-hover dropdown-center lg:dropdown-end">
                    <div tabIndex={0} role="button">
                        <IconComponent
                            icon="vertical"
                            classList="h-6 w-8 mt-1"
                        />
                    </div>

                    <ul
                        tabIndex={0}
                        className="
                            dropdown-content z-[1] p-3 shadow bg-base-300
                            rounded-xl w-[70vw] max-w-[240px]
                            md:w-auto md:min-w-[520px] md:max-w-[550px]
                            max-h-96 md:max-h-80 overflow-y-auto flex flex-col gap-3
                        "
                    >
                        <div className="w-full text-center font-semibold py-1">
                            {__("Choose chart color theme")}
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {sortedColors.map((color) => {
                                const isSelected = selectedColor === color.hex;
                                return (
                                    <motion.button
                                        key={color.hex}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        type="button"
                                        onClick={() =>
                                            setSelectedColor(color.hex)
                                        }
                                        className={`flex flex-col items-center p-2 rounded-lg border cursor-pointer ${
                                            isSelected
                                                ? "border-brandColor shadow"
                                                : "border-gray-200"
                                        }`}
                                        title={color.name}
                                    >
                                        <div
                                            className="relative w-7 h-7 md:w-9 md:h-9 rounded-full border shadow-sm"
                                            style={{
                                                backgroundColor: lightenHex(
                                                    color.hex,
                                                    40
                                                ),
                                                borderColor: color.hex,
                                            }}
                                        >
                                            {isSelected && (
                                                <span className="absolute inset-0 flex items-center justify-center">
                                                    <span
                                                        className="w-3 h-3 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                color.hex,
                                                        }}
                                                    />
                                                </span>
                                            )}
                                        </div>

                                        <span className="mt-1 text-xs capitalize line-clamp-1">
                                            {color.name}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </ul>
                </div>
            </aside>
        </section>
    );
}

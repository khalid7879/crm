import React from "react";
import IconComponent from "@/Components/IconComponent";
import { useTranslations } from "@/hooks/useTranslations";

/**
 * WidgetBasicComponent
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function WidgetBasicComponent({ stats = [] }) {
    const __ = useTranslations();
    const StatItem = ({ icon, label, value, showIcon = true }) => (
        <div className="flex items-center gap-3 px-3 h-16">
            {showIcon && (
                <div className="flex items-center justify-center w-8 h-8 rounded-full border border-base-300 text-base-content/60">
                    <IconComponent
                        icon={icon}
                        classList="w-4 h-4 text-brandColor"
                    />
                </div>
            )}
            <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold uppercase tracking-wide text-base-content/50">
                    {__(label)}
                </span>
                <span className="text-base-content md:text-sm">{value}</span>
            </div>
        </div>
    );

    return (
        <section className="mb-3 flex flex-col gap-3 lg:flex-row md:gap-4">
            {/* Primary Info */}
            {stats?.primary?.length > 0 && (
                <div className="grid grid-cols-1  md:grid-cols-3 bg-base-100 rounded-lg border border-base-300 overflow-hidden w-full lg:w-3/4">
                    {stats?.primary?.map((stat) => (
                        <div
                            key={stat.label}
                            className="border border-base-300 last:border-0 md:last:border-0"
                        >
                            <StatItem
                                icon={stat.icon}
                                label={stat.label}
                                value={stat.value}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Secondary Stats */}
            {stats?.secondary?.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 rounded-xl border border-brandColor/50 overflow-hidden w-full lg:w-1/4">
                    {stats?.secondary?.map((stat, index) => (
                        <div
                            key={stat.label}
                            className={`flex flex-col items-center justify-center px-4 py-3 text-center 
            transition duration-200 hover:bg-base-100 ${
                index !== stats.secondary.length - 1
                    ? "border-b md:border-b-0 md:border-r border-base-300"
                    : ""
            }`}
                        >
                            <span className="text-xl font-bold text-base-content">
                                {stat.value}
                            </span>
                            <span className="text-[11px] font-medium uppercase tracking-wide text-base-content/60">
                                {__(stat.label)}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

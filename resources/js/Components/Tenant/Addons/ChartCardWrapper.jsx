import React from "react";
import { Link } from "@inertiajs/react";
import IconComponent from "@/Components/IconComponent";
import { useTranslations } from "@/hooks/useTranslations";
import DynamicSkeletonLoader from "@/Components/Tenant/Addons/DynamicSkeletonLoader";
/**
 * ChartCardWrapper component (enhanced)
 *
 * Props:
 *  - title, value, info, children
 *  - loading (bool) -> centers loader in chart area
 *  - error (string|null) -> shows error UI
 *  - onRetry (fn) -> called when retry pressed
 *  - settingsMenu (ReactNode) -> optional custom settings menu content
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function ChartCardWrapper({
    title = "Chart Title",
    value = "0.00M",
    info = "Chart Info",
    children,
    loading = false,
    error = null,
    onRetry = null,
    settingsMenu = null,
}) {
    const __ = useTranslations();

    return (
        <div className="bg-base-100 rounded-md flex flex-col transition-transform hover:border-red-400">
            {/* Header */}
            <div className="flex items-start justify-between p-3">
                {/* Left Side */}
                {loading ? (
                    <DynamicSkeletonLoader
                        count={1}
                        avatar={true}
                        showContent={false}
                        titleLines={3}
                        avatarIsLeft={false}
                    />
                ) : (
                    <>
                        <div className="space-y-0.5">
                            <h4 className="text-md text-base-content/70 font-medium">
                                {__(title)}
                            </h4>
                            <div className="text-2xl font-semibold text-base-content">
                                {value}
                            </div>
                            <div className="text-xs text-base-content/70">
                                {__(info)}
                            </div>
                        </div>
                        {/* Right Side - actions */}
                        <div className="flex items-center gap-2">
                            {/* Settings dropdown (DaisyUI v5) */}
                            <div className="dropdown dropdown-end">
                                <label
                                    tabIndex={0}
                                    className="btn btn-ghost btn-square"
                                >
                                    <IconComponent
                                        icon="vertical"
                                        classList="text-2xl"
                                    />
                                </label>
                                <ul
                                    tabIndex={0}
                                    className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                                >
                                    {/* Allow parent to pass in menu items via settingsMenu prop */}
                                    {settingsMenu ? (
                                        settingsMenu
                                    ) : (
                                        <>
                                            <li className="px-2 py-1 text-xs text-base-content/70">
                                                Card Settings
                                            </li>
                                            <li>
                                                <button className="justify-start">
                                                    Change Range
                                                </button>
                                            </li>
                                            <li>
                                                <button className="justify-start">
                                                    Switch Chart Type
                                                </button>
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </div>

                            {/* Creator / link icons */}
                            {/* <Link
                                href="#"
                                className="hover:text-brandColor transition"
                            >
                                <IconComponent
                                    icon="userCircle"
                                    classList="text-lg"
                                />
                            </Link>

                            <Link
                                href="#"
                                className="hover:text-brandColor transition"
                            >
                                <IconComponent
                                    icon="link"
                                    classList="text-lg"
                                />
                            </Link> */}
                        </div>
                    </>
                )}
            </div>

            {/* Chart area */}
            <div className="min-h-40 w-full p-3 flex-1 flex flex-col">
                {/* When loading: centered loader */}
                {loading ? (
                    <div className="flex items-center justify-center h-full py-10">
                        {/* parent should pass LoadingSpinner as child or you can import one */}
                        {
                            children /* expects parent to render <LoadingSpinner /> when loading */
                        }
                    </div>
                ) : null}

                {/* When error: centered message + retry */}
                {!loading && error ? (
                    <div className="flex flex-col items-center justify-center h-full py-6 gap-3 text-sm text-red-500">
                        <div>Failed to load chart.</div>
                        <div className="flex gap-2">
                            {onRetry ? (
                                <button
                                    onClick={onRetry}
                                    className="btn btn-sm btn-outline"
                                >
                                    Retry
                                </button>
                            ) : null}
                        </div>
                    </div>
                ) : null}

                {/* When content available: render children in fade-in wrapper */}
                {!loading && !error ? (
                    <div className="w-full fade-in">{children}</div>
                ) : null}
            </div>
        </div>
    );
}

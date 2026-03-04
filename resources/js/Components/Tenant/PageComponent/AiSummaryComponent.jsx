import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRoute } from "ziggy";
import { router, usePage } from "@inertiajs/react";
import { useTranslations } from "@/hooks/useTranslations";
import IconComponent from "@/Components/IconComponent";
import LoadingSpinner from "@/Components/Tenant/Addons/LoadingSpinner";
import DynamicSkeletonLoader from "@/Components/Tenant/Addons/DynamicSkeletonLoader";
import SectionHeadingComponent from "@/Components/Tenant/Common/SectionHeadingComponent";
import DataNotFoundComponent from "@/Components/Tenant/Common/DataNotFoundComponent";

/**
 * AiSummaryComponent
 *
 * React component that displays AI-generated summaries and insights for a specific model (e.g., Lead).
 * It integrates with Inertia, Ziggy, and custom hooks/components to render overview stats,
 * AI insights, and a visual activity timeline.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {string|number} props.modelId - The unique identifier of the related model (e.g., lead ID).
 * @param {Object} props.modelData - The full data object for the model being analyzed.
 * @param {Array<Object>} [props.overviewStats=[]] - Statistical summary or key metrics related to the model.
 * @param {Array<Object>} [props.aiPayload=[]] - Raw or formatted AI analysis data (e.g., predictions, recommendations).
 * @param {Array<Object>} [props.existingAiAnalysis=[]] - Previously stored AI analyses retrieved from the backend.
 * @param {string} [props.type="LEAD"] - The model type being analyzed (e.g., "LEAD", "OPPORTUNITY").
 *
 * @returns {JSX.Element} The rendered AI summary section including overview, insights, and timeline.
 *
 * @example
 * <AiSummaryComponent
 *   modelId={lead.id}
 *   modelData={lead}
 *   overviewStats={[{ label: "Engagement", value: 95 }]}
 *   aiPayload={[{ summary: "Highly engaged", confidence: 0.93 }]}
 *   existingAiAnalysis={lead.ai_analysis}
 *   type="LEAD"
 * />
 *
 * @author Mamun Hossen
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */

function AiSummaryComponent({
    modelId,
    modelData,
    overviewStats = [],
    aiPayload = [],
    existingAiAnalysis = [],
    type = "LEAD",
}) {
    const hasExistingAnalysis =
        existingAiAnalysis && existingAiAnalysis?.hasAiAnalysis;

    const controller = new AbortController();
    const { signal } = controller;
    const __ = useTranslations();
    const page = usePage();
    const [loading, setLoading] = useState(!hasExistingAnalysis);
    const [error, setError] = useState(null);
    const [aiData, setAiData] = useState(existingAiAnalysis);
    const route = useRoute();
    const { tenant, tenantUsers, routeNames, aiHeaders } = page.props;

    /** Static Activity Log (Memoized) */
    const activityLog = useMemo(() => aiPayload?.combined, []);

    async function fetchAiSummary() {
        const header = {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content"),
            ...aiHeaders,
        };

        setLoading(true);
        setError(null);
        try {
            const raw = JSON.stringify({
                lead_details: {
                    company_name: modelData?.name ?? "",
                    lead_contact_name: modelData?.name ?? "",
                    contact_email: modelData?.name ?? "",
                    contact_phone: modelData?.name ?? "",
                    preferred_contact_method: modelData?.name ?? "",
                    industry_type: modelData?.name ?? "",
                    lead_pipeline: modelData?.name ?? "",
                },
                lead_history: activityLog,
            });

            const response = await fetch(routeNames?.aiRoutes?.leadAnalysis, {
                method: "POST",
                headers: header,
                body: raw,
                signal,
            });

            /* Stop if aborted */
            if (signal.aborted) return;

            const result = await response.json();

            // setAiData(result.ai_response);

            setAiData((oldAiData) => ({
                ...oldAiData,
                ...result.ai_response,
            }));

            await handleAiAnalysesStore(result);
        } catch (e) {
            if (e.name === "AbortError") {
                // console.log("AI summary fetch aborted.");
                return;
            }
            // console.error(e);
            setError(e.message);
        } finally {
            if (!signal.aborted) {
                setLoading(false);
            }
        }
    }

    /** Fetch AI Summary */
    useEffect(() => {
        !hasExistingAnalysis ? fetchAiSummary() : null;

        /** Cleanup — Abort fetch on unmount */
        return () => {
            controller.abort();
        };
    }, [hasExistingAnalysis]);

    /** Store ai analysis report */
    const handleAiAnalysesStore = async (data) => {
        try {
            const response = await fetch(
                route(routeNames?.aiAnalysisStore, { tenant, modelId }),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content"),
                    },
                    body: JSON.stringify({
                        ...data?.ai_response,
                        causer_id: tenantUsers.authUser,
                        type: type,
                    }),
                }
            );

            /* Parse JSON response */
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const resultAiAnalysesStore = await response.json();

            setAiData((oldAiData) => ({
                ...oldAiData,
                created_at: resultAiAnalysesStore.data.created_at,
            }));
        } catch (error) {
            console.error("Fetch error:", error);
        }
    };

    const { summary, current_position, next_best_action } = aiData || {};

    /** Prepare insights array (Memoized) */
    const insights = useMemo(
        () => [
            {
                label: __("Summary"),
                color: "from-brandColor to-secondary/20",
                text: summary,
            },
            {
                label: __("Current position"),
                color: "from-brandColor to-error/60",
                text: current_position,
            },
            {
                label: __("Next best action"),
                color: "from-brandColor to-warning/20",
                text: next_best_action,
            },
        ],
        [summary, current_position, next_best_action, __]
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
            {/* === LEFT: Overview + Timeline === */}
            <div className="col-span-3 backdrop-blur-xl rounded-md p-3 flex flex-col gap-6 border border-base-300 hover:border-brandColor/40 transition-all duration-500">
                <SectionHeadingComponent
                    heading="Lead overview"
                    hasBorder={false}
                />

                {/* Avatar + Identity */}
                <div className="flex items-center gap-4">
                    {modelData?.first_latter && (
                        <h2 className="h-16 w-16 shrink-0 rounded-full bg-gradient-to-br from-brandColor/30 to-brandColor/10 flex items-center justify-center text-brandColor text-xl font-bold">
                            {modelData.first_latter}
                        </h2>
                    )}
                    <div className="flex flex-col gap-1 w-full">
                        <p className="text-base font-semibold text-gray-800">
                            {modelData?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                            {__("Created at")}: {modelData?.created_at}
                        </p>
                    </div>
                </div>

                {/* Overview Stats */}
                <ul className="rounded-box divide-y divide-base-300/40 flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-6">
                    {overviewStats.map((item, i) => (
                        <li
                            key={i}
                            className="bg-base-100/60 border border-base-300/40 rounded-md p-3 hover:bg-base-200/50 hover:shadow-md transition-all duration-300"
                        >
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 shrink-0 flex items-center justify-center text-brandColor">
                                    <IconComponent
                                        icon={item.icon}
                                        classList="text-xl"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="font-semibold text-gray-500 tracking-wide capitalize text-sm">
                                        {__(item.label.replace(/_/g, " "))}
                                    </div>
                                    <div className="text-xs opacity-70 leading-snug">
                                        {item.value}
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>

                {/* Timeline */}
                <div className="bg-base-100/60">
                    <SectionHeadingComponent
                        heading="Activity timeline"
                        hasBorder={true}
                    />

                    {activityLog?.length > 0 ? (
                        <ul className="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">
                            {activityLog.map((item, index) => (
                                <li key={index}>
                                    {index !== 0 && (
                                        <hr className="opacity-50" />
                                    )}

                                    <div className="timeline-middle">
                                        <IconComponent
                                            icon="success2"
                                            classList="h-4 w-4 text-brandColor"
                                        />
                                    </div>

                                    <div
                                        className={`${
                                            index % 2 === 0
                                                ? "timeline-start md:text-end mb-10"
                                                : "timeline-end md:mb-10"
                                        }`}
                                    >
                                        <time className="font-mono italic text-xs opacity-70 text-gray-500 block mb-1">
                                            {[
                                                "19 Oct",
                                                "19 Oct",
                                                "21 Oct",
                                                "22 Oct",
                                            ][index] || "—"}
                                        </time>
                                        <div className="bg-base-200/70 border border-base-300/40 rounded-xl shadow-sm hover:shadow-md hover:border-brandColor/40 transition-all p-3">
                                            <div className="text-sm leading-relaxed">
                                                {item}
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="opacity-50" />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <DataNotFoundComponent label="No activities found" />
                    )}
                </div>
            </div>

            {/* === RIGHT: AI Insights Section === */}
            <div className="col-span-2 bg-gradient-to-br from-base-100/90 to-base-300/70 backdrop-blur-xl rounded-md p-3 border border-base-300 hover:border-brandColor/40 transition-all duration-500">
                {/* Section heading */}
                <section className="flex flex-col lg:flex-row items-center justify-between mb-3 gap-3 text-center lg:text-left">
                    <aside className="flex flex-col items-center lg:items-start">
                        <SectionHeadingComponent
                            heading="Ai insights"
                            hasBorder={false}
                        />
                        <p className="text-xs text-base-content/50 italic -mt-1">
                            <span>{__("Last update")}</span>
                            <span className="text-lg mx-1">:</span>
                            <span>{aiData?.created_at || __("N/A")}</span>
                        </p>
                    </aside>

                    <div className="flex justify-center lg:justify-end w-full lg:w-auto">
                        {loading ? (
                            <LoadingSpinner
                                title="I am thinking"
                                size="sm"
                                style="ring"
                                color="secondary"
                            />
                        ) : (
                            <button
                                onClick={() => fetchAiSummary()}
                                className="flex items-center justify-center gap-1 px-3 py-1 rounded-md bg-gradient-to-r from-brandColor/90 to-brandColor hover:from-brandColor hover:to-brandColor/90 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 group cursor-pointer"
                            >
                                <IconComponent
                                    icon="ai4"
                                    classList="text-md text-white group-hover:rotate-180 transition-transform duration-500"
                                />
                                <span className="tracking-wide text-[11px]">
                                    {__("Refetch")}
                                </span>
                            </button>
                        )}
                    </div>
                </section>

                {/* Today’s Date-Time Section */}

                {/* Insights List */}
                {loading ? (
                    <div className="space-y-4">
                        <DynamicSkeletonLoader count={3} />
                    </div>
                ) : error ? (
                    <div className="alert alert-error shadow-lg my-4">
                        <IconComponent
                            icon="alert-triangle"
                            classList="text-xl"
                        />
                        <span>{__(`Error loading AI summary: ${error}`)}</span>
                    </div>
                ) : (
                    <ul className="rounded-box divide-y divide-base-300/60 select-text">
                        {insights.map(
                            (item, i) =>
                                item.text && (
                                    <li
                                        key={i}
                                        className="transition-all duration-300 hover:shadow-sm hover:-translate-y-[2px] hover:bg-base-200/40 rounded-xl p-3 group"
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Icon Badge */}
                                            <div
                                                className={`h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-base-100 shadow-md group-hover:scale-110 transition-transform`}
                                            >
                                                <IconComponent
                                                    icon="ai3"
                                                    classList="text-lg"
                                                />
                                            </div>

                                            {/* Text Section */}
                                            <div className="flex flex-col flex-1">
                                                <div className="font-semibold text-sm tracking-wide text-base-content/90 group-hover:text-base-content transition-colors">
                                                    {item.label}
                                                </div>
                                                <div className="text-xs text-base-content/70 leading-snug mt-0.5">
                                                    {item.text}
                                                </div>
                                            </div>

                                            {/* Right Side Accent Dot */}
                                            <div className="h-2 w-2 rounded-full bg-base-300 opacity-0 group-hover:opacity-70 transition-opacity"></div>
                                        </div>
                                    </li>
                                )
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default React.memo(AiSummaryComponent);

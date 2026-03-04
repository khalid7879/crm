import React, { useEffect, useState, Suspense, lazy } from "react";
import ChartCardWrapper from "@/Components/Tenant/Addons/ChartCardWrapper";
import chartComponentsFactory from "@/utils/common/chartComponentsFactory";
import LoadingSpinner from "@/Components/Tenant/Addons/LoadingSpinner";
import { useTranslations } from "@/hooks/useTranslations";

/**
 * SingleChartCard Component
 *
 * This component dynamically loads a chart component based on data returned
 * from a backend API. It wraps the chart inside a styled ChartCardWrapper and
 * supports lazy-loading, error handling, and loading states.
 *
 * @component
 * @param {Object} props
 * @param {string} props.routeUrl - The endpoint URL to fetch chart data and component mapping.
 *
 * @returns {JSX.Element}
 *
 * @example <SingleChartCard routeUrl={route('tenant.chart.summary')} />
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function SingleChartCard({ routeUrl, graphColor = null }) {
    const __ = useTranslations();
    const [chart, setChart] = useState(null);
    const [RenderChartComponent, setChartComponent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchChart = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(routeUrl);

            if (!res.ok) throw new Error("Request failed");

            const json = await res.json();
            
            const jsComponent = json?.data?.jsComponent;

            if (jsComponent && chartComponentsFactory[jsComponent]) {
                const LazyComponent = lazy(chartComponentsFactory[jsComponent]);
                setChartComponent(() => LazyComponent);
            }

            setChart(json.data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChart();
    }, []);


    return (
        <ChartCardWrapper
            title={chart?.title}
            value={chart?.value}
            info={chart?.info}
            loading={loading}
        >
            {loading && <LoadingSpinner style="ring" showTitle={false} />}

            {error && !loading && (
                <div className="flex flex-col items-center justify-center h-40 text-red-500">
                    <div>{__("Failed to load")}</div>
                    <button
                        className="btn btn-sm btn-primary mt-2"
                        onClick={fetchChart}
                    >
                        {__("Retry")}
                    </button>
                </div>
            )}

            {!loading && !error && RenderChartComponent && (
                <Suspense
                    fallback={
                        <div className="flex items-center justify-center h-40">
                            <LoadingSpinner
                                style="ring"
                                showTitle={false}
                                size="xl"
                            />
                        </div>
                    }
                >
                    <RenderChartComponent
                        data={chart?.items}
                        fillColor={graphColor}
                        {...(chart?.chartAdditionalProps || {})}
                    />
                </Suspense>
            )}
        </ChartCardWrapper>
    );
}

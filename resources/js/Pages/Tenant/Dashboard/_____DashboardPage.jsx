// import React, { useState, useEffect, Suspense, lazy } from "react";
// import { usePage } from "@inertiajs/react";
// import { useRoute } from "ziggy";
// import TenantDashboardLayout from "@/Components/Tenant/TenantDashboardLayout";
// import { useTranslations } from "@/hooks/useTranslations";
// import { BusinessSettingsBreadItems } from "@/utils/common/BreadcrumbNavItems";
// import ChartCard from "@/Components/Tenant/Addons/ChartCard";
// import { useInView } from "react-intersection-observer";

// // Lazy load chart components (they load only when visible)
// const CreateFunnelSvgChart = lazy(() =>
//     import("@/Components/Tenant/GraphsAndTrees/CreateFunnelSvgChart")
// );
// const CreatePieChart = lazy(() =>
//     import("@/Components/Tenant/GraphsAndTrees/CreatePieChart")
// );
// const CreateBarChart = lazy(() =>
//     import("@/Components/Tenant/GraphsAndTrees/CreateBarChart")
// );
// const CreateComposedBarChart = lazy(() =>
//     import("@/Components/Tenant/GraphsAndTrees/CreateComposedBarChart")
// );
// const CreateCustomShapeBarChart = lazy(() =>
//     import("@/Components/Tenant/GraphsAndTrees/CreateCustomShapeBarChart")
// );

// export default function DashboardPage() {
//     const __ = useTranslations();
//     const route = useRoute();
//     const page = usePage();
//     const metaTitle = __("Dashboard");
//     const { tenant, routeNames, reports } = page.props;

//     console.log(reports);

//     /** Skeleton placeholder **/
//     const SkeletonLoader = () => (
//         <div className="animate-pulse space-y-4">
//             <div className="h-6 bg-base-300 rounded w-3/4"></div>
//             <div className="h-48 bg-base-200 rounded"></div>
//         </div>
//     );

//     /** Each Chart wrapper handles its own visibility and data fetching **/
//     const LazyChartCard = ({ title, info, value, ChartComponent }) => {
//         const { ref, inView } = useInView({
//             triggerOnce: true,
//             threshold: 0.2,
//         });
//         const [data, setData] = useState([]);
//         const [loading, setLoading] = useState(true);

//         useEffect(() => {
//             if (inView && loading && data.length === 0) {
//                 // Only fetch/calculate when visible for first time
//                 setTimeout(() => {
//                     const dummy = [
//                         {
//                             value: "10M",
//                             name: "1 - Prospecting",
//                             fill: "blue",
//                             extra: "Leads in first stage",
//                         },
//                         {
//                             value: "7M",
//                             name: "2 - Qualification",
//                             fill: "green",
//                             extra: "Qualified leads",
//                         },
//                         {
//                             value: "6.5M",
//                             name: "3 - Needs Analysis",
//                             fill: "red",
//                             extra: "Needs identified",
//                         },
//                         {
//                             value: "5M",
//                             name: "4 - Proposal",
//                             fill: "darkcyan",
//                             extra: "Proposal sent for won",
//                         },
//                         {
//                             value: "5.5M",
//                             name: "5 - Negotiation",
//                             fill: "#f58520",
//                             extra: "Deals closed",
//                         },
//                     ];
//                     setData(dummy);
//                     setLoading(false);
//                 }, 1200); // Simulate API delay
//             }
//         }, [inView, loading, data.length]);

//         return (
//             <ChartCard title={title} info={info} value={value}>
//                 <div ref={ref} className="min-h-[220px]">
//                     {!inView || loading ? (
//                         <SkeletonLoader />
//                     ) : (
//                         <Suspense fallback={<SkeletonLoader />}>
//                             <ChartComponent dataSource={data} />
//                         </Suspense>
//                     )}
//                 </div>
//             </ChartCard>
//         );
//     };

//     return (
//         <TenantDashboardLayout
//             metaTitle={metaTitle}
//             breadNavItems={[...BusinessSettingsBreadItems]}
//         >
//             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
//                 <CreateCustomShapeBarChart></CreateCustomShapeBarChart>
//                 <CreateComposedBarChart></CreateComposedBarChart>
//                 {/* You can duplicate more blocks for 10+ charts */}
//                 <LazyChartCard
//                     title="Sales pipeline funnel"
//                     info="Sum of opportunity value"
//                     value="10.5M"
//                     ChartComponent={CreateFunnelSvgChart}
//                 />
//                 <LazyChartCard
//                     title="Total value by opportunity state"
//                     info="Sum of opportunity value"
//                     value="15M"
//                     ChartComponent={CreatePieChart}
//                 />
//                 <LazyChartCard
//                     title="Opportunity state by value"
//                     info="Sum of opportunity value"
//                     value="15M"
//                     ChartComponent={CreateBarChart}
//                 />
//                 {/* Example additional charts to simulate scroll */}
//                 <LazyChartCard
//                     title="Lead Source Performance"
//                     info="Lead distribution by source"
//                     value="8.2M"
//                     ChartComponent={CreatePieChart}
//                 />
//                 <LazyChartCard
//                     title="Conversion Rate Over Time"
//                     info="Monthly conversion performance"
//                     value="4.7M"
//                     ChartComponent={CreateBarChart}
//                 />
//                 <LazyChartCard
//                     title="Regional Sales Breakdown"
//                     info="By territory and region"
//                     value="12M"
//                     ChartComponent={CreatePieChart}
//                 />
//                 <LazyChartCard
//                     title="Top Performing Reps"
//                     info="Revenue by salesperson"
//                     value="6.8M"
//                     ChartComponent={CreateBarChart}
//                 />
//                 <LazyChartCard
//                     title="Lost Deals Funnel"
//                     info="Value of lost opportunities"
//                     value="3.2M"
//                     ChartComponent={CreateFunnelSvgChart}
//                 />
//                 <LazyChartCard
//                     title="Revenue Forecast"
//                     info="Projected pipeline revenue"
//                     value="20M"
//                     ChartComponent={CreateBarChart}
//                 />
//                 <LazyChartCard
//                     title="Client Retention Funnel"
//                     info="Retention vs new deals"
//                     value="9.1M"
//                     ChartComponent={CreateFunnelSvgChart}
//                 />
//             </div>
//         </TenantDashboardLayout>
//     );
// }

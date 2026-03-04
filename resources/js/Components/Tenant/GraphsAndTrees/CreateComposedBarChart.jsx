import React from "react";
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

/**
 * CreateComposedBarChart Component
 *
 * A reusable composed chart that combines both bar and line visualizations using Recharts.
 * The chart is responsive and adapts its size based on its container.
 *
 * @returns {JSX.Element} A composed chart showing sample data with both bar and line elements.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function CreateComposedBarChart({
    data = [],
    width = "",
    height = "",
}) {
    // const data = [
    //     { index: 1, month: "Dec 24", year: 2024, total_leads: 16 },
    //     { index: 2, month: "Jan 25", year: 2025, total_leads: 15 },
    //     { index: 3, month: "Feb 25", year: 2025, total_leads: 10 },
    //     { index: 4, month: "Mar 25", year: 2025, total_leads: 16 },
    //     { index: 5, month: "Apr 25", year: 2025, total_leads: 16 },
    //     { index: 6, month: "May 25", year: 2025, total_leads: 10 },
    //     { index: 7, month: "Jun 25", year: 2025, total_leads: 11 },
    //     { index: 8, month: "Jul 25", year: 2025, total_leads: 10 },
    //     { index: 9, month: "Aug 25", year: 2025, total_leads: 15 },
    //     { index: 10, month: "Sep 25", year: 2025, total_leads: 15 },
    //     { index: 11, month: "Oct 25", year: 2025, total_leads: 19 },
    //     { index: 12, month: "Nov 25", year: 2025, total_leads: 17 },
    // ];
    // #endregion

    return (
        <div className="w-full max-w-3xl mx-auto">
            <ResponsiveContainer width="100%" aspect={1.618}>
                <ComposedChart
                    data={data}
                    margin={{ top: 20, right: 0, bottom: 0, left: 0 }}
                >
                    <CartesianGrid stroke="#f5f5f5" />
                    <XAxis dataKey="month" scale="band" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total_leads" barSize={20} fill="#413ea0" />
                    <Line
                        type="monotone"
                        dataKey="total_leads"
                        stroke="#ff7300"
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}

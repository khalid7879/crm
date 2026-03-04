import React, { useState, useCallback, useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    LabelList,
    CartesianGrid,
} from "recharts";
import { generateColorFusions } from "@/utils/common/helpers";

/**
 * CreateBarChart Component
 *
 * @component
 * @description
 * A responsive bar chart with:
 *  - Dynamic bar colors
 *  - Hover highlight
 *  - X-axis shows labelShort by default
 *  - Tooltip shows labelLong and count on hover (text color matches bar color)
 *  - Top bar labels show count with first letter capitalized
 *
 * @example
 * const sampleData = [
 *   { labelShort: "Jan", labelLong: "January", count: 50 },
 *   { labelShort: "Feb", labelLong: "February", count: 75 },
 *   { labelShort: "Mar", labelLong: "March", count: 30 },
 * ];
 *
 * <CreateBarChart
 *   data={sampleData}
 *   width={400}
 *   height={300}
 *   fillColor="#3f51b5"
 *   barSize={25}
 * />
 *
 * @param {Object[]} data - Array of data objects representing each bar.
 * @param {string} data[].labelShort - Short label for X-axis.
 * @param {string} data[].labelLong - Full label for tooltip/hover.
 * @param {number} data[].count - Numeric value for the bar.
 * @param {number|string} [width="100%"] - Chart width.
 * @param {number} [height=250] - Chart height.
 * @param {string} [fillColor="#3f51b5"] - Default bar color.
 * @param {number} [barSize=20] - Bar width.
 *
 * @returns {JSX.Element} A responsive bar chart component.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function CreateBarChart({
    data,
    width = "100%",
    height = 250,
    barSize = 20,
    fillColor = "#3f51b5",
    showCartesianGrid = false,
}) {
    const [hoverIndex, setHoverIndex] = useState(null);

    const colors = useMemo(() => {
        return data.length > 0
            ? generateColorFusions(fillColor, data.length)
            : [];
    }, [fillColor, data.length]);

    /** Capitalize first character */
    const formatLabel = useCallback((value) => {
        if (!value) return "";
        return (
            value.toString().charAt(0).toUpperCase() + value.toString().slice(1)
        );
    }, []);

    /** Custom X-Axis Tick */
    const CustomTick = useCallback(
        ({ x, y, index }) => (
            <text
                x={x}
                y={y + 10}
                textAnchor="middle"
                fontSize={12}
                fill="#666"
            >
                {data[index]?.labelShort}
            </text>
        ),
        [data]
    );

    /** Custom Tooltip showing labelLong and count */
    const CustomTooltip = useCallback(
        ({ active, payload }) => {
            if (active && payload && payload.length) {
                const { labelLong, count } = payload[0].payload;
                return (
                    <div
                        style={{
                            background: "#fff",
                            padding: "8px 12px",
                            border: "1px solid #ccc",
                            borderRadius: 4,
                            color: fillColor,
                        }}
                    >
                        <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                            {labelLong}
                        </div>
                        <div>Count: {count}</div>
                    </div>
                );
            }
            return null;
        },
        [fillColor]
    );

    /** Render Bar Cells with hover effect */
    const barCells = useMemo(
        () =>
            data.map((_, index) => (
                <Cell
                    key={index}
                    fill={colors[index] || fillColor}
                />
            )),
        [data, hoverIndex, fillColor, colors]
    );

    return (
        <ResponsiveContainer width={width} height={height}>
            <BarChart data={data}>
                {showCartesianGrid && <CartesianGrid strokeDasharray="3 3" />}
                <XAxis
                    dataKey="labelShort"
                    interval={0}
                    tick={<CustomTick />}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                    dataKey="count"
                    barSize={barSize}
                    onMouseOver={(_, index) => setHoverIndex(index)}
                    onMouseOut={() => setHoverIndex(null)}
                >
                    {barCells}
                    <LabelList
                        dataKey="count"
                        position="top"
                        fontSize={12}
                        fill={fillColor}
                        formatter={formatLabel}
                    />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

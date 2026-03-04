import React, { useState, useCallback, useMemo } from "react";
import {
    ComposedChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
    LabelList,
} from "recharts";
import { generateColorFusions } from "@/utils/common/helpers";

/**
 * CreateBarVerticalChart Component with Color Fusion
 *
 * @component
 * @description
 * Vertical ComposedChart with:
 *  - Gradient color fusion for each bar
 *  - Hover highlight
 *  - Tooltip showing labelLong, count, and info
 *  - Y-axis uses labelShort
 *
 * @example
 * const sampleData = [
 *   {
 *     index: 1,
 *     labelShort: "Aidan Rempel DVM",
 *     labelLong: "Aidan Rempel Doctor of Veterinary Medicine",
 *     count: 29,
 *     cumulative_total: 29,
 *     info: "Users who own the most leads in the system"
 *   },
 *   {
 *     index: 2,
 *     labelShort: "Dr. Ansel Hagenes IV",
 *     labelLong: "",
 *     count: 14,
 *     cumulative_total: 43,
 *     info: ""
 *   },
 * ];
 *
 * <CreateBarVerticalChart
 *   data={sampleData}
 *   width={400}
 *   height={500}
 *   fillColor="#3f51b5"
 * />
 *
 * @param {Object[]} data - Array of data objects.
 * @param {string} data[].labelShort - Short label for Y-axis.
 * @param {string} data[].labelLong - Full label for tooltip.
 * @param {number} data[].count - Numeric value for bar.
 * @param {number} data[].cumulative_total - Cumulative total value.
 * @param {number} data[].index - Index for ordering.
 * @param {string} data[].info - Additional info.
 * @param {number|string} [width="100%"] - Chart width.
 * @param {number} [height=400] - Chart height.
 * @param {string} [fillColor="#413ea0"] - Base color for fusion.
 *
 * @returns {JSX.Element} Vertical composed chart component.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function CreateBarVerticalChart({
    data,
    width = "100%",
    height = 400,
    fillColor = "#413ea0",
    barSize = 20,
    showCartesianGrid = false,
}) {
    /** Capitalize first character */
    const formatLabel = useCallback((value) => {
        if (!value) return "";
        return (
            value.toString().charAt(0).toUpperCase() + value.toString().slice(1)
        );
    }, []);

    const colors = useMemo(() => {
        return data.length > 0
            ? generateColorFusions(fillColor, data.length)
            : [];
    }, [fillColor, data.length]);

    const [hoverIndex, setHoverIndex] = useState(null);

    /** Custom Y-Axis Tick */
    const CustomTick = useCallback(
        ({ x, y, index }) => (
            <text
                x={x - 8}
                y={y + 5}
                textAnchor="end"
                fontSize={12}
                fill={fillColor}
            >
                {data[index]?.labelShort}
            </text>
        ),
        [data, fillColor]
    );

    /** Custom Tooltip showing labelLong, count, info */
    const CustomTooltip = useCallback(({ active, payload }) => {
        if (active && payload && payload.length) {
            const { labelShort, labelLong, count, info } = payload[0].payload;
            return (
                <div
                    style={{
                        background: "#fff",
                        padding: "8px 12px",
                        border: "1px solid #ccc",
                        borderRadius: 6,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                >
                    <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                        {labelLong || labelShort}
                    </div>
                    <div>Count: {count}</div>
                    {info && (
                        <div style={{ fontSize: 12, color: "#555" }}>
                            {info}
                        </div>
                    )}
                </div>
            );
        }
        return null;
    }, []);

    /** Bar cells with color fusion & hover highlight */
    const barCells = useMemo(
        () =>
            data.map((_, index) => (
                <Cell
                    key={index}
                    fill={
                        hoverIndex === index
                            ? "#f58520"
                            : colors[index] || fillColor
                    }
                    style={{ transition: "all 0.3s ease", cursor: "pointer" }}
                />
            )),
        [data, hoverIndex, colors, fillColor]
    );

    return (
        <ResponsiveContainer width={width} height={height}>
            <ComposedChart
                layout="vertical"
                data={data}
                margin={{ top: 20, right: 20, bottom: 20, left: 60 }}
            >
                {showCartesianGrid && <CartesianGrid strokeDasharray="3 3" />}
                <XAxis
                    type="number"
                    tick={{ fill: fillColor, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    label={""}
                />
                <YAxis
                    dataKey="labelShort"
                    type="category"
                    tick={<CustomTick />}
                    width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                    dataKey="count"
                    barSize={barSize}
                    onMouseOver={(_, index) => setHoverIndex(index)}
                    onMouseOut={() => setHoverIndex(null)}
                >
                    {barCells}
                    {/* LabelList removed to hide text below bars */}
                    <LabelList
                        dataKey="count"
                        position="right"
                        fontSize={12}
                        fill={fillColor}
                        formatter={formatLabel}
                    />
                </Bar>
            </ComposedChart>
        </ResponsiveContainer>
    );
}

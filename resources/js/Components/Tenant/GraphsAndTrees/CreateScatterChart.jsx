import React, { useState, useCallback, useMemo } from "react";
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ZAxis,
    Cell,
    LabelList,
    ReferenceLine,
} from "recharts";

/**
 * BeautifulScatterChart Component
 *
 * @param {Object[]} data - Data array containing index, count, cumulative_total, etc.
 * @param {string|number} width - Chart width.
 * @param {number} height - Chart height.
 * @param {string} pointColor - Primary color for the bubbles.
 */
export default function CreateScatterChart({
    data,
    width = "100%",
    height = 400, // Increased height slightly for better breathing room
    pointColor = "#6366f1", // Modern Indigo
}) {
    const [hoverIndex, setHoverIndex] = useState(null);

    // Modern color palette
    const HOVER_COLOR = "#f43f5e"; // Rose/Coral for focus
    const GRID_COLOR = "#e5e7eb"; // Very light grey
    const TEXT_COLOR = "#374151"; // Dark grey text (softer than black)

    const formatLabel = useCallback((value) => {
        if (!value) return "";
        return (
            value.toString().charAt(0).toUpperCase() + value.toString().slice(1)
        );
    }, []);

    /**
     * Beautiful Custom Tick
     * Using a lighter font weight and subtle color
     */
    const CustomTick = useCallback(
        ({ x, y, payload, index }) => {
            // Guard against index out of bounds if data length mismatch
            const label = data[index]?.labelShort || payload.value;
            return (
                <g transform={`translate(${x},${y})`}>
                    <text
                        x={0}
                        y={0}
                        dy={16}
                        textAnchor="middle"
                        fill="#6b7280" // Cool grey
                        fontSize={12}
                        fontWeight={500}
                        style={{ fontFamily: "sans-serif" }}
                    >
                        {label}
                    </text>
                </g>
            );
        },
        [data]
    );

    /**
     * Glassmorphism Tooltip
     */
    const CustomTooltip = useCallback(
        ({ active, payload }) => {
            if (active && payload && payload.length) {
                // Extract data from the payload
                const {
                    labelLong,
                    index: xVal,
                    count: yVal,
                    cumulative_total: zVal,
                } = payload[0].payload;

                return (
                    <div
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            border: "1px solid rgba(0,0,0,0.05)",
                            boxShadow:
                                "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                            borderRadius: "12px",
                            padding: "12px 16px",
                            backdropFilter: "blur(4px)",
                            minWidth: "150px",
                        }}
                    >
                        <h4
                            style={{
                                margin: "0 0 8px 0",
                                color: "#111827",
                                fontSize: "14px",
                                fontWeight: "700",
                                borderBottom: `2px solid ${
                                    hoverIndex !== null
                                        ? HOVER_COLOR
                                        : pointColor
                                }`,
                                paddingBottom: "4px",
                                display: "inline-block",
                            }}
                        >
                            {labelLong}
                        </h4>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                                fontSize: "12px",
                                color: "#4b5563",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                                <span>Index (X):</span>{" "}
                                <span style={{ fontWeight: 600 }}>{xVal}</span>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                                <span>Count (Y):</span>{" "}
                                <span style={{ fontWeight: 600 }}>{yVal}</span>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                                <span>Size (Z):</span>{" "}
                                <span style={{ fontWeight: 600 }}>{zVal}</span>
                            </div>
                        </div>
                    </div>
                );
            }
            return null;
        },
        [hoverIndex, pointColor, HOVER_COLOR]
    );

    const scatterCells = useMemo(
        () =>
            data.map((entry, index) => {
                const isHovered = index === hoverIndex;
                // If something is hovered, dim the others slightly
                const opacity = hoverIndex === null ? 0.7 : isHovered ? 1 : 0.3;

                return (
                    <Cell
                        key={`cell-${index}`}
                        fill={isHovered ? HOVER_COLOR : pointColor}
                        fillOpacity={opacity}
                        stroke={isHovered ? "#fff" : "none"} // Add white border on hover for pop
                        strokeWidth={2}
                    />
                );
            }),
        [data, hoverIndex, pointColor, HOVER_COLOR]
    );

    return (
        <div
            style={{
                width,
                height,
                position: "relative",
                fontFamily: "system-ui, sans-serif",
            }}
        >
            <ResponsiveContainer>
                <ScatterChart
                    margin={{ top: 30, right: 30, bottom: 20, left: 10 }}
                >
                    {/* Subtle Grid */}
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false} // Horizontal lines only often looks cleaner
                        stroke={GRID_COLOR}
                    />

                    <XAxis
                        type="number"
                        dataKey="index"
                        tick={<CustomTick />}
                        axisLine={{ stroke: GRID_COLOR }}
                        tickLine={false}
                        // Add padding to axis so bubbles don't get cut off at edges
                        domain={["dataMin - 1", "dataMax + 1"]}
                        interval={0} // Force all ticks if possible
                    />

                    <YAxis
                        type="number"
                        dataKey="count"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#9ca3af", fontSize: 12 }}
                    />

                    {/* Adjust range for bubble sizes relative to chart size */}
                    <ZAxis dataKey="cumulative_total" range={[100, 1000]} />

                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ strokeDasharray: "3 3", stroke: "#cbd5e1" }} // Custom crosshair cursor
                        isAnimationActive={true}
                    />

                    <Scatter
                        data={data}
                        onMouseOver={(_, index) => setHoverIndex(index)}
                        onMouseOut={() => setHoverIndex(null)}
                        isAnimationActive={true}
                        animationDuration={800}
                    >
                        {scatterCells}

                        <LabelList
                            dataKey="labelShort"
                            position="top"
                            offset={10}
                            style={{
                                fontSize: "11px",
                                fontWeight: "600",
                                fill: TEXT_COLOR,
                                pointerEvents: "none", // Prevent label interactions
                                opacity: 0.8,
                            }}
                            formatter={formatLabel}
                        />
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
}

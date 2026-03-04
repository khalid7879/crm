import React, { useMemo } from "react";
import {
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import { generateColorFusions } from "@/utils/common/helpers";

/** Function to create a triangle path */
const getPath = (x, y, width, height) => {
    return `M${x},${y + height}
    C${x + width / 3},${y + height} ${x + width / 2},${y + height / 3} ${
        x + width / 2
    },${y}
    C${x + width / 2},${y + height / 3} ${x + (2 * width) / 3},${y + height} ${
        x + width
    },${y + height}
    Z`;
};

/** Custom triangle-shaped bar */
const TriangleBar = (props) => {
    const { fill, x, y, width, height } = props;

    if (
        x === undefined ||
        y === undefined ||
        width === undefined ||
        height === undefined
    )
        return null;

    return <path d={getPath(x, y, width, height)} stroke="none" fill={fill} />;
};

/** Custom tooltip content */
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const { labelShort, count, labelLong } = payload[0].payload;
        return (
            <div className="bg-white border border-gray-300 p-2 rounded shadow">
                <strong>{labelLong || labelShort}</strong>
                <div>Count: {count}</div>
            </div>
        );
    }
    return null;
};

/**
 * CreateCustomShapeBarChart Component
 *
 * Renders a responsive triangle-shaped bar chart with enhanced features:
 *  - Dynamic color fusions based on a base color
 *  - Tooltip on hover displaying full label and count
 *  - All horizontal labels visible with rotation support for long labels
 *
 * @component
 *
 * @param {Object[]} data - Array of chart data objects.
 * @param {string} data[].labelShort - Short label displayed on X-axis.
 * @param {string} [data[].labelLong] - Optional long label displayed in tooltip.
 * @param {number} data[].count - Numeric value for the bar height.
 *
 * @param {string} [fillColor="#3f51b5"] - Base color used to generate gradient/fusion colors.
 * @param {number|string} [height=400] - Height of the chart container.
 * @param {number|string} [width="100%"] - Width of the chart container.
 * @returns {JSX.Element} Responsive triangle-shaped bar chart.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
function CreateCustomShapeBarChart({
    data = [],
    fillColor = "#3f51b5",
    height = 400,
    width = "100%",
}) {
    /** Memoized colors – recalculates only when fillColor or data.length changes */
    const colors = useMemo(() => {
        return data.length > 0
            ? generateColorFusions(fillColor, data.length)
            : [];
    }, [fillColor, data.length]);

    return (
        <div
            style={{
                width: typeof width === "number" ? `${width}px` : width,
                maxWidth: "700px",
                height: typeof height === "number" ? `${height}px` : height,
                margin: "0 auto",
            }}
        >
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 10,
                        left: 10,
                        bottom: 50,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                        dataKey="labelShort"
                        interval={0}
                        angle={-35}
                        textAnchor="end"
                        height={60}
                        tick={{ fill: fillColor }}
                    />

                    <YAxis tick={{ fill: fillColor }} />

                    <Tooltip content={<CustomTooltip />} />

                    <Bar
                        dataKey="count"
                        shape={<TriangleBar fill={fillColor} />}
                        label={{ position: "top", fill: fillColor }}
                    >
                        {colors.map((color, index) => (
                            <Cell
                                key={index}
                                fill={color}
                                stroke="none"
                                cursor="pointer"
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export default React.memo(CreateCustomShapeBarChart);

import React, { useMemo } from "react";
import { generateColorFusions } from "@/utils/common/helpers";
import {
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Cell,
    Pie,
} from "recharts";

/**
 * CreatePieChart Component
 *
 * Renders a responsive Pie Chart using Recharts.
 *
 * @component
 * @param {Object[]} data - Array of pie slice objects.
 * @param {string} data[].labelShort - Label for legend and tooltip.
 * @param {number} data[].count - Numeric value for the pie slice.
 *
 * @param {string} [fillColor="#3f51b5"] - Base color used to generate fused color variations for slices.
 * @param {number} [height=400] - Minimum height of the chart container.
 * @param {string|number} [width="100%"] - Width of the chart container.
 * @param {number|null} [innerRadius=null] - Inner radius for donut-style charts.
 *
 * @returns {JSX.Element} Responsive Pie Chart component.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
const CreatePieChart = ({
    data = [],
    fillColor = "#3f51b5",
    height = 400,
    width = "100%",
    innerRadius = null,
}) => {
    /** Memoized colors – recalculates only when fillColor or data.length changes */
    const colors = useMemo(() => {
        return data.length > 0
            ? generateColorFusions(fillColor, data.length)
            : [];
    }, [fillColor, data.length]);

    return (
        <ResponsiveContainer minHeight={height} width={width}>
            <PieChart>
                <Pie
                    cx="50%"
                    cy="50%"
                    data={data}
                    dataKey="count"
                    nameKey="labelShort"
                    innerRadius={innerRadius}
                    label
                >
                    {colors.map((color, index) => (
                        <Cell key={index} fill={color} stroke="none" />
                    ))}
                </Pie>

                <Legend />
                <Tooltip />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default CreatePieChart;

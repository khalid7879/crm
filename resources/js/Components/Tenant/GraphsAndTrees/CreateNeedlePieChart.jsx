import React, { useMemo } from "react";
import { Pie, PieChart, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { generateColorFusions } from "@/utils/common/helpers";

/**
 * ===============================
 * Needle Component
 * ===============================
 * Draws a gauge-style needle consisting of:
 *  - A circular base positioned at the chart's center
 *  - A pointer line rotated using the midAngle of the active slice
 */
const Needle = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    needleColor,
}) => {
    const baseX = cx;
    const baseY = cy;

    /**
     * Needle length is calculated as a position halfway
     * between inner and outer radius.
     */
    const length = innerRadius + (outerRadius - innerRadius) / 2;

    return (
        <g>
            {/**
             * Circular base of needle
             */}
            <circle cx={baseX} cy={baseY} r={5} fill={needleColor} />

            {/**
             * Needle pointer line
             */}
            <path
                d={`M${baseX},${baseY}l${length},0`}
                stroke={needleColor}
                strokeWidth={2}
                style={{
                    transform: `rotate(-${midAngle}deg)`,
                    transformOrigin: `${baseX}px ${baseY}px`,
                }}
            />
        </g>
    );
};

/**
 * Converts a percentage into two pie slices.
 */
const buildNeedleSlice = (percentage) => [
    { name: "Converted", value: percentage },
    { name: "Remaining", value: 100 - percentage },
];

/**
 * ============================================
 * CreateNeedlePieChart Component
 * ============================================
 *
 * Renders a half-circle gauge-style Pie Chart using Recharts.
 * The chart displays:
 *  - Dynamic data slices (from backend stats)
 *  - Auto-generated color fusions based on a base color
 *  - A needle indicating a percentage value (conversion rate)
 *
 * The component is designed to work with the output of:
 * `getLeadsByConversionRateReport()`
 *
 * @component
 *
 * @param {Object} props - Component properties
 *
 * @param {Object[]} props.data
 *     Array of backend data rows used to render the colored slices.
 *     Each item should include:
 *     - {string} labelShort  Slice label
 *     - {number} count       Slice numeric value
 *
 * @param {string} [props.fillColor="#3f51b5"]
 *     Base color used to generate color fusion gradients
 *     for all slices and the needle.
 *
 * @param {number|string} [props.height=250]
 *     Height of the chart container. Can be a number (px) or string (e.g. "300px").
 *
 * @param {number|string} [props.width="100%"]
 *     Width of the chart container. Accepts number or CSS string.
 *
 * @param {number} [props.conversionRate=0]
 *     Percentage value (0–100) that determines where the needle points.
 *     Typically this is the `value` field from the backend response.
 *
 * @returns {JSX.Element}  A responsive gauge-style Pie Chart with dynamic slices and needle.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */

const CreateNeedlePieChart = ({
    data,
    fillColor = "#3f51b5",
    height = 250,
    width = "100%",
    conversionRate = 0,
}) => {
    /**
     * Build needle slices
     */
    const needleSlices = buildNeedleSlice(conversionRate);

    /**
     * Colors for main slices
     */
    const colors = useMemo(() => {
        return generateColorFusions(fillColor, data.length);
    }, [data.length, fillColor]);

    /**
     * Colors for needle + needle remaining slice
     */
    const needleColors = useMemo(() => {
        return generateColorFusions(fillColor, 2);
    }, [fillColor]);

    return (
        <ResponsiveContainer width={width} minHeight={height}>
            <PieChart>
                {/**
                 * =====================================
                 * Main half-donut data slices
                 * =====================================
                 */}
                <Pie
                    data={data}
                    dataKey="count"
                    nameKey="labelShort"
                    cx="50%"
                    cy="100%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={50}
                    outerRadius={100}
                    stroke="none"
                >
                    {colors.map((color, index) => (
                        <Cell key={index} fill={color} stroke="none" />
                    ))}
                </Pie>

                {/**
                 * =====================================
                 * Needle overlay layer
                 * =====================================
                 */}
                <Pie
                    data={needleSlices}
                    dataKey="value"
                    cx="50%"
                    cy="100%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={50}
                    outerRadius={100}
                    stroke="none"
                    activeIndex={0}
                    activeShape={(props) => (
                        <Needle {...props} needleColor={needleColors[0]} />
                    )}
                >
                    <Cell fill={needleColors[0]} />
                    <Cell fill={needleColors[1]} />
                </Pie>

                <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default CreateNeedlePieChart;

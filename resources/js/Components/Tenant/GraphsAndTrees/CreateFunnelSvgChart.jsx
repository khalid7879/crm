import React, {
    useMemo,
    useState,
    useRef,
    useEffect,
    useCallback,
} from "react";
import { generateColorFusions } from "@/utils/common/helpers";

/**
 * CreateFunnelSvgChart
 *
 * A reusable SVG funnel chart component that renders funnel stages with gradient colors,
 * hover effects, and optional labels inside each segment.
 *
 * Features:
 * - Dynamic number of stages with gradient coloring
 * - Hover effect highlights a stage with scale + brightness
 * - Optional label inside each funnel segment
 * - Tooltip showing label and count of hovered stage
 * - Auto-hover first or last stage on mount
 *
 * Props:
 * @param {Array} data - Array of funnel stages. Each stage should have the following structure:
 *   [
 *     {
 *       index: 1,            // Unique stage index
 *       labelShort: "Lead",  // Optional short label (shown inside funnel if enabled)
 *       labelLong: "Leads",  // Full label (shown in tooltip)
 *       count: 120           // Numeric value for stage
 *     },
 *     { index: 2, labelShort: "Demo", labelLong: "Demo Booked", count: 80 },
 *     ...
 *   ]
 * @param {string} fillColor - Base color used for gradients (default: "#3f51b5")
 * @param {number|string} height - SVG height in px (default: 400)
 * @param {number|string} width - Container width in px or %, default "100%"
 * @param {boolean} showLabelInsideFunnel - Display labels inside each funnel segment (default: false)
 * @param {boolean} autoHoverFirst - Automatically hover the first stage on mount (default: false)
 * @param {boolean} autoHoverLast - Automatically hover the last stage on mount (default: false)
 *
 * Example usage:
 * ```jsx
 * <CreateFunnelSvgChart
 *   data={[
 *     { index: 1, labelShort: "Lead", labelLong: "Leads", count: 120 },
 *     { index: 2, labelShort: "Demo", labelLong: "Demo Booked", count: 80 },
 *     { index: 3, labelShort: "Proposal", labelLong: "Proposals Sent", count: 50 },
 *     { index: 4, labelShort: "Closed", labelLong: "Deals Closed", count: 30 }
 *   ]}
 *   fillColor="#ff5722"
 *   height={400}
 *   width="100%"
 *   showLabelInsideFunnel={true}
 *   autoHoverFirst={true}
 * />
 * ```
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
const CreateFunnelSvgChart = ({
    data = [],
    fillColor = "#3f51b5",
    height = 400,
    width = "100%",
    showLabelInsideFunnel = false,
    autoHoverFirst = false,
    autoHoverLast = false,
}) => {
    const containerRef = useRef(null);

    /** Generate solid base colors for gradient */
    const colors = useMemo(
        () => (data.length ? generateColorFusions(fillColor, data.length) : []),
        [fillColor, data.length]
    );

    const [hoveredStage, setHoveredStage] = useState(null);

    /** Auto-hover first or last stage on mount */
    useEffect(() => {
        if (!data.length) return;
        if (autoHoverLast) setHoveredStage(data[data.length - 1]);
        else if (autoHoverFirst) setHoveredStage(data[0]);
    }, [autoHoverFirst, autoHoverLast, data]);

    /** Canvas sizes */
    const SVG_W = 450;
    const SVG_H = typeof height === "number" && height >= 300 ? height : 400;

    /** Funnel dimensions */
    const funnelTopWidth = 450;
    const funnelBottomWidth = 120;
    const funnelHeight = SVG_H - 30;
    const segmentHeight = funnelHeight / data.length;

    /** Memoized function for trapezoid points and text positioning */
    const getSegmentPoints = useCallback(
        (idx) => {
            const topWidth =
                funnelTopWidth -
                ((funnelTopWidth - funnelBottomWidth) / data.length) * idx;
            const bottomWidth =
                funnelTopWidth -
                ((funnelTopWidth - funnelBottomWidth) / data.length) *
                    (idx + 1);
            const yTop = 10 + segmentHeight * idx;
            const yBottom = yTop + segmentHeight;
            const xTopLeft = (SVG_W - topWidth) / 2;
            const xTopRight = xTopLeft + topWidth;
            const xBottomLeft = (SVG_W - bottomWidth) / 2;
            const xBottomRight = xBottomLeft + bottomWidth;

            return {
                points: `${xTopLeft},${yTop} ${xTopRight},${yTop} ${xBottomRight},${yBottom} ${xBottomLeft},${yBottom}`,
                textX: SVG_W / 2,
                textY: yTop + segmentHeight / 2,
            };
        },
        [data.length, segmentHeight]
    );

    return (
        <section
            ref={containerRef}
            style={{
                position: "relative",
                width: typeof width === "number" ? `${width}px` : width,
                margin: "0 auto",
            }}
        >
            {/* Tooltip */}
            {hoveredStage && (
                <div
                    style={{
                        position: "absolute",
                        top: "5px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "#fff",
                        padding: "10px",
                        borderRadius: "8px",
                        fontSize: "16px",
                        fontWeight: "500",
                        minWidth: width,
                        textAlign: "center",
                        pointerEvents: "none",
                        zIndex: 20,
                        color: "#999",
                    }}
                >
                    {hoveredStage.labelLong}: {hoveredStage.count}
                </div>
            )}

            <figure style={{ display: "block", width: "100%" }}>
                <svg
                    width={width}
                    height={SVG_H}
                    viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                    style={{ maxWidth: "100%", display: "block" }}
                >
                    {/* Gradient Definitions */}
                    <defs>
                        {colors.map((color, idx) => (
                            <linearGradient
                                key={idx}
                                id={`funnelGradient-${idx}`}
                                x1="0%"
                                y1="0%"
                                x2="0%"
                                y2="100%"
                            >
                                <stop
                                    offset="0%"
                                    stopColor={color}
                                    stopOpacity="1"
                                />
                                <stop
                                    offset="100%"
                                    stopColor={color}
                                    stopOpacity="0.55"
                                />
                            </linearGradient>
                        ))}
                    </defs>

                    {data.map((stage, idx) => {
                        const { points, textX, textY } = getSegmentPoints(idx);
                        const isHovered = hoveredStage?.index === stage.index;

                        return (
                            <g key={stage.index}>
                                {/* Funnel segment */}
                                <polygon
                                    points={points}
                                    fill={`url(#funnelGradient-${idx})`}
                                    stroke={colors[idx]}
                                    strokeWidth="2"
                                    style={{
                                        transition: "all 0.25s ease",
                                        transformOrigin: "center",
                                        cursor: "pointer",
                                        filter: isHovered
                                            ? "brightness(1.18) saturate(1.18)"
                                            : "none",
                                        transform: isHovered
                                            ? "scale(1.03)"
                                            : "scale(1)",
                                    }}
                                    onMouseEnter={() => setHoveredStage(stage)}
                                    onMouseLeave={() => {
                                        if (!autoHoverFirst && !autoHoverLast)
                                            setHoveredStage(null);
                                    }}
                                />

                                {/* Label inside funnel */}
                                {showLabelInsideFunnel && (
                                    <text
                                        x={textX}
                                        y={textY}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fill="#fff"
                                        fontSize="16"
                                        fontWeight="500"
                                        style={{
                                            pointerEvents: "none",
                                            userSelect: "none",
                                        }}
                                    >
                                        {stage.labelShort ?? stage.labelLong}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </figure>
        </section>
    );
};

export default CreateFunnelSvgChart;

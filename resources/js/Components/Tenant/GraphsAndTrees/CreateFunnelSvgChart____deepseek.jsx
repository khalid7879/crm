import React, { useState, useMemo, useEffect } from "react";

/**
 * Responsive SVG Funnel Chart Component
 * @param {Object} props
 * @param {Array} props.dataSource - Array of funnel stages with label, value, color, and extra info
 * @param {number|string} props.width - Width of the SVG (number or string with px/%)
 * @param {number|string} props.height - Height of the SVG (number or string with px/%)
 * @param {boolean} props.showValues - Whether to display values on each segment
 * @param {boolean} props.showPercentage - Whether to show percentage of total
 * @param {string} props.backgroundColor - Background color for the SVG
 */
export default function CreateFunnelSvgChart({
    dataSource = [
        {
            label: "Visits",
            value: 1000,
            extra: "Website visitors",
            color: "#4A90E2",
        },
        {
            label: "Leads",
            value: 600,
            extra: "Contact form submissions",
            color: "#50E3C2",
        },
        {
            label: "Trial",
            value: 300,
            extra: "Free trial signups",
            color: "#F5A623",
        },
        {
            label: "Customers",
            value: 150,
            extra: "Paying customers",
            color: "#7ED321",
        },
    ],
    width = 400,
    height = 300,
    showValues = true,
    showPercentage = true,
    backgroundColor = "transparent",
}) {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [isClient, setIsClient] = useState(false);

    // Ensure we're running on client side for dimensions
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Parse and validate dimensions
    useEffect(() => {
        if (!isClient) return;

        const parseDimension = (dim) => {
            if (typeof dim === "number") return dim;
            if (typeof dim === "string") {
                // Remove non-numeric characters except decimal point
                const num = parseFloat(dim.replace(/[^\d.]/g, ""));
                return isNaN(num) ? (dim === "width" ? 400 : 300) : num;
            }
            return dim === "width" ? 400 : 300;
        };

        setDimensions({
            width: parseDimension(width),
            height: parseDimension(height),
        });
    }, [width, height, isClient]);

    // Safely calculate total value with validation
    const { totalValue, isValidData } = useMemo(() => {
        if (!Array.isArray(dataSource) || dataSource.length === 0) {
            return { totalValue: 1, isValidData: false };
        }

        let total = 0;
        let hasValidValues = true;

        for (const item of dataSource) {
            const value = Number(item.value);
            if (isNaN(value) || value < 0) {
                hasValidValues = false;
                console.warn(`Invalid value in funnel data: ${item.value}`);
            } else {
                total += value;
            }
        }

        return {
            totalValue: total > 0 ? total : 1,
            isValidData: hasValidValues && dataSource.length > 0,
        };
    }, [dataSource]);

    // Calculate maximum value for scaling (used for first segment)
    const maxValue = useMemo(() => {
        if (!isValidData) return 1;
        return Math.max(...dataSource.map((item) => Number(item.value) || 0));
    }, [dataSource, isValidData]);

    // Generate funnel segments
    const segments = useMemo(() => {
        if (
            !isValidData ||
            !dimensions.width ||
            !dimensions.height ||
            dimensions.width <= 0 ||
            dimensions.height <= 0
        ) {
            return [];
        }

        const segmentHeight =
            dimensions.height / Math.max(dataSource.length, 1);
        const segments = [];
        const padding = 2; // Small gap between segments
        const cornerRadius = 4; // Rounded corners

        for (let i = 0; i < dataSource.length; i++) {
            const item = dataSource[i];
            const value = Number(item.value) || 0;

            // Calculate previous value for top width
            let prevValue;
            if (i === 0) {
                prevValue = maxValue; // First segment uses max value as previous
            } else {
                prevValue = Number(dataSource[i - 1].value) || 0;
            }

            // Calculate widths based on values
            const topWidth = Math.max(
                10,
                (prevValue / maxValue) * (dimensions.width * 0.8)
            );
            const bottomWidth = Math.max(
                10,
                (value / maxValue) * (dimensions.width * 0.8)
            );

            // Calculate positions with centering
            const xTop = (dimensions.width - topWidth) / 2;
            const xBottom = (dimensions.width - bottomWidth) / 2;
            const yTop = segmentHeight * i + padding;
            const yBottom = segmentHeight * (i + 1) - padding;

            // Ensure valid coordinates
            const safeCoords = (val) =>
                isNaN(val) || !isFinite(val) ? 0 : Math.max(0, val);

            const safeXTop = safeCoords(xTop);
            const safeYTop = safeCoords(yTop);
            const safeXBottom = safeCoords(xBottom);
            const safeYBottom = safeCoords(yBottom);
            const safeTopWidth = safeCoords(topWidth);
            const safeBottomWidth = safeCoords(bottomWidth);

            // Create path for trapezoid with rounded corners
            const pathData = `
                M ${safeXTop + cornerRadius},${safeYTop}
                L ${safeXTop + safeTopWidth - cornerRadius},${safeYTop}
                Q ${safeXTop + safeTopWidth},${safeYTop} ${
                safeXTop + safeTopWidth
            },${safeYTop + cornerRadius}
                L ${safeXBottom + safeBottomWidth},${safeYBottom - cornerRadius}
                Q ${safeXBottom + safeBottomWidth},${safeYBottom} ${
                safeXBottom + safeBottomWidth - cornerRadius
            },${safeYBottom}
                L ${safeXBottom + cornerRadius},${safeYBottom}
                Q ${safeXBottom},${safeYBottom} ${safeXBottom},${
                safeYBottom - cornerRadius
            }
                L ${safeXTop},${safeYTop + cornerRadius}
                Q ${safeXTop},${safeYTop} ${safeXTop + cornerRadius},${safeYTop}
                Z
            `;

            // Calculate percentage
            const percentage =
                totalValue > 0
                    ? ((value / totalValue) * 100).toFixed(1)
                    : "0.0";

            // Determine text color based on segment color brightness
            const hexColor = item.color || "#3f51b5";
            const r = parseInt(hexColor.slice(1, 3), 16);
            const g = parseInt(hexColor.slice(3, 5), 16);
            const b = parseInt(hexColor.slice(5, 7), 16);
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            const textColor = brightness > 128 ? "#000000" : "#FFFFFF";

            segments.push({
                index: i,
                pathData,
                label: item.label || `Stage ${i + 1}`,
                value,
                extra: item.extra,
                color: hexColor,
                textColor,
                percentage,
                centerX: dimensions.width / 2,
                centerY: (safeYTop + safeYBottom) / 2,
                topY: safeYTop,
                bottomY: safeYBottom,
                isHovered: hoveredIndex === i,
            });
        }

        return segments;
    }, [
        dataSource,
        dimensions,
        maxValue,
        totalValue,
        hoveredIndex,
        isValidData,
    ]);

    // Handle invalid data state
    if (!isValidData) {
        return (
            <div
                style={{
                    width: typeof width === "string" ? width : `${width}px`,
                    height: typeof height === "string" ? height : `${height}px`,
                    backgroundColor: "#f8f9fa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px",
                    border: "1px dashed #dee2e6",
                }}
            >
                <div style={{ textAlign: "center", color: "#6c757d" }}>
                    <div style={{ fontSize: "14px", fontWeight: "500" }}>
                        Invalid Data
                    </div>
                    <div style={{ fontSize: "12px", marginTop: "4px" }}>
                        Please check your data source
                    </div>
                </div>
            </div>
        );
    }

    // Handle empty data
    if (dataSource.length === 0) {
        return (
            <div
                style={{
                    width: typeof width === "string" ? width : `${width}px`,
                    height: typeof height === "string" ? height : `${height}px`,
                    backgroundColor: "#f8f9fa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px",
                    border: "1px dashed #dee2e6",
                }}
            >
                <div style={{ textAlign: "center", color: "#6c757d" }}>
                    <div style={{ fontSize: "14px", fontWeight: "500" }}>
                        No Data Available
                    </div>
                    <div style={{ fontSize: "12px", marginTop: "4px" }}>
                        Add data to display the funnel
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                width: typeof width === "string" ? width : `${width}px`,
                height: typeof height === "string" ? height : `${height}px`,
                backgroundColor,
                position: "relative",
            }}
        >
            <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                preserveAspectRatio="xMidYMid meet"
                style={{ display: "block" }}
            >
                {/* Render all segments */}
                {segments.map((segment) => (
                    <g
                        key={segment.index}
                        onMouseEnter={() => setHoveredIndex(segment.index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        style={{
                            cursor: "pointer",
                            transition: "opacity 0.2s ease",
                        }}
                    >
                        {/* Segment path */}
                        <path
                            d={segment.pathData}
                            fill={segment.color}
                            opacity={segment.isHovered ? 0.85 : 1}
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                        />

                        {/* Main label */}
                        <text
                            x={segment.centerX}
                            y={segment.centerY}
                            fill={segment.textColor}
                            fontSize="11"
                            fontWeight="600"
                            textAnchor="middle"
                            dominantBaseline="middle"
                        >
                            {segment.label}
                        </text>

                        {/* Value and percentage (always shown) */}
                        <text
                            x={segment.centerX}
                            y={segment.centerY + 14}
                            fill={segment.textColor}
                            fontSize="9"
                            fontWeight="500"
                            textAnchor="middle"
                            dominantBaseline="hanging"
                        >
                            {showValues &&
                                `${segment.value.toLocaleString()}${
                                    showPercentage
                                        ? ` (${segment.percentage}%)`
                                        : ""
                                }`}
                        </text>

                        {/* Extra info on hover */}
                        {segment.isHovered && segment.extra && (
                            <g>
                                <rect
                                    x={segment.centerX - 60}
                                    y={segment.bottomY - 40}
                                    width={120}
                                    height={30}
                                    rx="4"
                                    fill="#333333"
                                    fillOpacity="0.9"
                                />
                                <text
                                    x={segment.centerX}
                                    y={segment.bottomY - 25}
                                    fill="#ffffff"
                                    fontSize="9"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                >
                                    {segment.extra}
                                </text>
                            </g>
                        )}
                    </g>
                ))}

                {/* Total value display at bottom */}
                <text
                    x={dimensions.width / 2}
                    y={dimensions.height - 5}
                    fill="#666666"
                    fontSize="10"
                    textAnchor="middle"
                    dominantBaseline="alphabetic"
                    fontWeight="500"
                >
                    Total: {totalValue.toLocaleString()}
                </text>
            </svg>

            {/* Legend for color coding */}
            <div
                style={{
                    position: "absolute",
                    bottom: "20px",
                    right: "10px",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    fontSize: "10px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
            >
                <div style={{ fontWeight: "600", marginBottom: "3px" }}>
                    Stages
                </div>
                {segments.slice(0, 4).map((segment, idx) => (
                    <div
                        key={idx}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "2px",
                        }}
                    >
                        <div
                            style={{
                                width: "10px",
                                height: "10px",
                                backgroundColor: segment.color,
                                marginRight: "6px",
                                borderRadius: "2px",
                            }}
                        />
                        <span style={{ fontSize: "9px" }}>
                            {segment.label}: {segment.value.toLocaleString()}
                        </span>
                    </div>
                ))}
                {segments.length > 4 && (
                    <div
                        style={{
                            fontSize: "9px",
                            color: "#666",
                            marginTop: "3px",
                        }}
                    >
                        +{segments.length - 4} more stages
                    </div>
                )}
            </div>
        </div>
    );
}

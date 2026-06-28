import React, { useState } from 'react';

export const LineChart = ({ data = {}, height = 240 }) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const maxVal = Math.max(...values, 5); // Fallback to 5 if empty or all 0s

    const width = 500;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const [activePoint, setActivePoint] = useState(null);

    // Compute coordinates
    const points = keys.map((key, index) => {
        const x = paddingLeft + (index * (chartWidth / (keys.length - 1 || 1)));
        const val = data[key] || 0;
        const y = paddingTop + chartHeight - ((val / maxVal) * chartHeight);
        return { x, y, label: key, value: val };
    });

    // Create Path String
    let pathD = '';
    let fillD = '';

    if (points.length > 0) {
        pathD = `M ${points[0].x} ${points[0].y}`;
        fillD = `M ${points[0].x} ${paddingTop + chartHeight}`;

        points.forEach((p, idx) => {
            if (idx > 0) {
                // Use bezier curves or straight lines. Let's use clean line segments.
                pathD += ` L ${p.x} ${p.y}`;
            }
            fillD += ` L ${p.x} ${p.y}`;
        });

        fillD += ` L ${points[points.length - 1].x} ${paddingTop + chartHeight} Z`;
    }

    // Grid lines count
    const gridLines = 4;
    const gridYValues = Array.from({ length: gridLines + 1 }, (_, idx) => {
        return Math.round((maxVal / gridLines) * idx);
    });

    return (
        <div className="relative w-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1899e6" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#1899e6" stopOpacity="0.0" />
                    </linearGradient>
                </defs>

                {/* Y-Axis Gridlines and Labels */}
                {gridYValues.map((val, idx) => {
                    const y = paddingTop + chartHeight - ((val / maxVal) * chartHeight);
                    return (
                        <g key={idx} className="opacity-40 dark:opacity-20">
                            <line
                                x1={paddingLeft}
                                y1={y}
                                x2={width - paddingRight}
                                y2={y}
                                stroke="currentColor"
                                strokeWidth="1"
                                strokeDasharray="3,3"
                                className="text-slate-300 dark:text-slate-700"
                            />
                            <text
                                x={paddingLeft - 10}
                                y={y + 4}
                                textAnchor="end"
                                className="text-[10px] font-medium fill-slate-400 dark:fill-slate-500"
                            >
                                {val}
                            </text>
                        </g>
                    );
                })}

                {/* Area under the line */}
                {fillD && <path d={fillD} fill="url(#chartGradient)" />}

                {/* Main line */}
                {pathD && (
                    <path
                        d={pathD}
                        fill="none"
                        stroke="#1899e6"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                )}

                {/* Interactive Points */}
                {points.map((p, idx) => (
                    <g key={idx}>
                        <circle
                            cx={p.x}
                            cy={p.y}
                            r={activePoint?.index === idx ? 6 : 4}
                            fill={activePoint?.index === idx ? '#1899e6' : '#fff'}
                            stroke="#1899e6"
                            strokeWidth={activePoint?.index === idx ? 3 : 2}
                            className="cursor-pointer transition-all dark:fill-slate-900"
                            onMouseEnter={() => setActivePoint({ ...p, index: idx })}
                            onMouseLeave={() => setActivePoint(null)}
                        />
                        {/* Invisible larger hit area for easier hover */}
                        <circle
                            cx={p.x}
                            cy={p.y}
                            r="15"
                            fill="transparent"
                            className="cursor-pointer"
                            onMouseEnter={() => setActivePoint({ ...p, index: idx })}
                            onMouseLeave={() => setActivePoint(null)}
                        />
                    </g>
                ))}

                {/* X-Axis Labels */}
                {points.map((p, idx) => {
                    // Only show alternate labels if keys are dense
                    if (keys.length > 7 && idx % 2 !== 0) return null;
                    // Format dates (e.g. yyyy-MM-dd -> MM-dd)
                    const displayLabel = p.label.length > 5 ? p.label.substring(5) : p.label;
                    return (
                        <text
                            key={idx}
                            x={p.x}
                            y={height - paddingBottom + 18}
                            textAnchor="middle"
                            className="text-[10px] font-medium fill-slate-400 dark:fill-slate-500"
                        >
                            {displayLabel}
                        </text>
                    );
                })}
            </svg>

            {/* Custom Tooltip */}
            {activePoint && (
                <div
                    className="absolute bg-slate-900/90 text-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-700/50 shadow-md backdrop-blur-sm pointer-events-none transform -translate-x-1/2 -translate-y-full flex flex-col gap-0.5"
                    style={{
                        left: `${(activePoint.x / width) * 100}%`,
                        top: `${(activePoint.y / height) * 100 - 8}%`,
                    }}
                >
                    <span className="font-semibold">{activePoint.value} Calls</span>
                    <span className="text-[10px] opacity-60">{activePoint.label}</span>
                </div>
            )}
        </div>
    );
};

export const BarChart = ({ data = {}, height = 240 }) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const maxVal = Math.max(...values, 5);

    const width = 500;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const [activeBar, setActiveBar] = useState(null);

    const barWidth = Math.max(8, (chartWidth / keys.length) * 0.5);
    const gap = (chartWidth / keys.length) * 0.5;

    const gridLines = 4;
    const gridYValues = Array.from({ length: gridLines + 1 }, (_, idx) => {
        return Math.round((maxVal / gridLines) * idx);
    });

    return (
        <div className="relative w-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
                {/* Y-Axis Gridlines */}
                {gridYValues.map((val, idx) => {
                    const y = paddingTop + chartHeight - ((val / maxVal) * chartHeight);
                    return (
                        <g key={idx} className="opacity-40 dark:opacity-20">
                            <line
                                x1={paddingLeft}
                                y1={y}
                                x2={width - paddingRight}
                                y2={y}
                                stroke="currentColor"
                                strokeWidth="1"
                                strokeDasharray="3,3"
                                className="text-slate-300 dark:text-slate-700"
                            />
                            <text
                                x={paddingLeft - 10}
                                y={y + 4}
                                textAnchor="end"
                                className="text-[10px] font-medium fill-slate-400 dark:fill-slate-500"
                            >
                                {val}
                            </text>
                        </g>
                    );
                })}

                {/* Bars */}
                {keys.map((key, idx) => {
                    const val = data[key] || 0;
                    const barHeight = (val / maxVal) * chartHeight;
                    const x = paddingLeft + gap/2 + idx * (barWidth + gap);
                    const y = paddingTop + chartHeight - barHeight;

                    const isActive = activeBar?.index === idx;

                    return (
                        <g key={idx}>
                            <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={Math.max(barHeight, 2)} // Guarantee minimum height
                                rx={Math.min(barWidth / 2, 4)}
                                fill={isActive ? '#1899e6' : '#1899e6cc'}
                                className="cursor-pointer transition-all duration-200 hover:fill-brand-600"
                                onMouseEnter={() => setActiveBar({ value: val, label: key, index: idx, x: x + barWidth/2, y })}
                                onMouseLeave={() => setActiveBar(null)}
                            />
                            {/* Invisible background helper hit area */}
                            <rect
                                x={x - gap/2}
                                y={paddingTop}
                                width={barWidth + gap}
                                height={chartHeight}
                                fill="transparent"
                                className="cursor-pointer"
                                onMouseEnter={() => setActiveBar({ value: val, label: key, index: idx, x: x + barWidth/2, y })}
                                onMouseLeave={() => setActiveBar(null)}
                            />
                        </g>
                    );
                })}

                {/* X-Axis Labels */}
                {keys.map((key, idx) => {
                    const x = paddingLeft + gap/2 + idx * (barWidth + gap) + barWidth / 2;
                    if (keys.length > 7 && idx % 2 !== 0) return null;
                    const displayLabel = key.length > 5 ? key.substring(5) : key;
                    return (
                        <text
                            key={idx}
                            x={x}
                            y={height - paddingBottom + 18}
                            textAnchor="middle"
                            className="text-[10px] font-medium fill-slate-400 dark:fill-slate-500"
                        >
                            {displayLabel}
                        </text>
                    );
                })}
            </svg>

            {/* Custom Tooltip */}
            {activeBar && (
                <div
                    className="absolute bg-slate-900/90 text-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-700/50 shadow-md backdrop-blur-sm pointer-events-none transform -translate-x-1/2 -translate-y-full flex flex-col gap-0.5"
                    style={{
                        left: `${(activeBar.x / width) * 100}%`,
                        top: `${(activeBar.y / height) * 100 - 8}%`,
                    }}
                >
                    <span className="font-semibold">{activeBar.value} Calls</span>
                    <span className="text-[10px] opacity-60">{activeBar.label}</span>
                </div>
            )}
        </div>
    );
};

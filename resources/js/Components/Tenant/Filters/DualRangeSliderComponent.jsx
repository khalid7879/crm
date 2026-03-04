import React, { useState } from "react";

export default function DualRangeSliderComponent({
    minAmount = 20000,
    maxAmount = 100000,
    onChange,
}) {
    const [minVal, setMinVal] = useState(minAmount);
    const [maxVal, setMaxVal] = useState(maxAmount);

    const updateParent = (newMin, newMax) => {
        if (onChange) {
            onChange({
                target: {
                    name: "amountRange",
                    value: { minAmount: newMin, maxAmount: newMax },
                },
            });
        }
    };

    const handleMinChange = (e) => {
        const value = Number(e.target.value);
        if (value < maxVal) {
            setMinVal(value);
            updateParent(value, maxVal);
        }
    };

    const handleMaxChange = (e) => {
        const value = Number(e.target.value);
        if (value > minVal) {
            setMaxVal(value);
            updateParent(minVal, value);
        }
    };

    return (
        <div className="w-full px-4">
            <label htmlFor="">Opportunity value range</label>
            <div className="flex items-center gap-4 mb-3">
                <div className="bg-green-600 text-white px-3 py-1 rounded">
                     {minVal.toLocaleString()}
                </div>
                <div className="bg-green-600 text-white px-3 py-1 rounded">
                     {maxVal.toLocaleString()}
                </div>
            </div>

            <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-2 bg-gray-300 rounded"></div>

                <div
                    className="absolute top-1/2 h-2 bg-green-500 rounded"
                    style={{
                        left: `${
                            ((minVal - minAmount) / (maxAmount - minAmount)) *
                            100
                        }%`,
                        width: `${
                            ((maxVal - minVal) / (maxAmount - minAmount)) * 100
                        }%`,
                    }}
                ></div>

                <input
                    type="range"
                    min={minAmount}
                    max={maxAmount}
                    value={minVal}
                    onChange={handleMinChange}
                    className="absolute w-full pointer-events-none appearance-none bg-transparent
                        [&::-webkit-slider-thumb]:pointer-events-auto
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:h-4
                        [&::-webkit-slider-thumb]:w-4
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-green-600"
                />

                <input
                    type="range"
                    min={minAmount}
                    max={maxAmount}
                    value={maxVal}
                    onChange={handleMaxChange}
                    className="absolute w-full pointer-events-none appearance-none bg-transparent
                        [&::-webkit-slider-thumb]:pointer-events-auto
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:h-4
                        [&::-webkit-slider-thumb]:w-4
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-green-600"
                />
            </div>
        </div>
    );
}

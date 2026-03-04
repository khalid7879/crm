import React from "react";
import IconComponent from "@/Components/IconComponent";
import Select from "react-select";

export default function OptionComponent({
    label = "",
    className = "flex flex-col space-2",
    options = [],
    id = "",
    method,
}) {
    return (
        <div className={className}>
            <div className="relative">
                {/* <Select
                    id="activeStatus"
                    className="ml-2"
                    onChange={method}
                    options={options}
                /> */}
                <select onChange={method} id={id}>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

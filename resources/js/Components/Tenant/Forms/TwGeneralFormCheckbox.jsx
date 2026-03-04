import React from "react";

export default function TwGeneralFormCheckbox({ label }) {
    return (
        <label className="label cursor-pointer gap-2 mt-7">
            <input type="checkbox" className="checkbox checkbox-primary" />
            <span className="label-text font-medium">{label}</span>
        </label>
    );
}

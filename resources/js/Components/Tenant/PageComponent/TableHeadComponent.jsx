import React from "react";
import IconComponent from "@/Components/IconComponent";

export default function TableCardComponent({ children }) {
    return (
        <thead className="bg-gray-50">
            <tr>{children}</tr>
        </thead>
    );
}

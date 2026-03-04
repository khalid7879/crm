import React from "react";
/**
 * TableBodyComponent
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function TableBodyComponent({ children }) {
    return (
        <tbody className="bg-base-100 divide-y divide-gray-200">
            {children}
        </tbody>
    );
}

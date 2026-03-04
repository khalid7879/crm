import React from "react";
/**
 * TableHeadComponent
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function TableHeadComponent({ children }) {
    return (
        <thead>
            <tr>{children}</tr>
        </thead>
    );
}

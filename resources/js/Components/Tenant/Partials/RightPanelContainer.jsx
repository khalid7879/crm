import React, { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import { useRoute } from "ziggy";
import IconComponent from "@/Components/IconComponent";

export default function RightPanelContainer({ children,  className = "w-full  p-4 rounded-2xl box-con", }) {
    const route = useRoute();
    const { tenant } = usePage().props;


    return (
        <div className="tab-pane block" id="general" role="tabpanel">
            <div className={className}>
                {children}
            </div>
        </div>
    );
}

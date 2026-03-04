/** React import required */
import React from "react";
import.meta.glob(["../images/**/*.{jpg,jpeg,png,webp}"]);
import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
// import "./echo";

createInertiaApp({
    title: (title) => `${title ? title : "Home"} | SASS CRM iHelp`,
    resolve: (name) => {
        const pages = import.meta.glob("./Pages/**/*.jsx", { eager: true });
        return pages[`./Pages/${name}.jsx`];
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});

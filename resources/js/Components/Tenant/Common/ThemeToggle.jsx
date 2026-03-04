import React, { useEffect, useState } from "react";
import IconComponent from "@/Components/IconComponent";

export default function ThemeToggle() {
    /* Load saved theme or fallback to "light"  */
    const [theme, setTheme] = useState(
        localStorage.getItem("theme") || "light"
    );

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <label className="swap swap-rotate">
            <input
                type="checkbox"
                onChange={toggleTheme}
                checked={theme === "light"}
            />
            {/* sun icon for light mode */}
            <IconComponent icon="sun" classList="swap-off text-xl" />
            {/* moon icon for dark mode */}
            <IconComponent icon="moon" classList="swap-on text-2xl" />
        </label>
    );
}

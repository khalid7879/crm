import React, { useState } from "react";
import TopBar from "@/Components/Tenant/Partials/TopBar";
import Sidebar from "@/Components/Tenant/Partials/Sidebar";

/***
 * TenantRootLayout
 * ----------------
 * Main layout component for tenant dashboard pages.
 * Provides a fixed sidebar, fixed top bar, and scrollable content area.
 *
 * @component
 * @param {object} props
 * @param {React.ReactNode} props.children - The main page content to render inside the layout.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 ***/
export default function TenantRootLayout({ children }) {
    /***
     * State for sidebar collapsed/expanded.
     * Initially collapsed on small devices (<640px), expanded on larger screens.
     ***/
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() =>
        typeof window !== "undefined" && window.innerWidth < 640 ? true : false
    );

    /***
     * Toggle sidebar collapse/expand state
     ***/
    const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

    /***
     * Determine sidebar width based on collapse state
     ***/
    const sidebarWidth = sidebarCollapsed ? "w-16" : "w-44";

    return (
        <main className="flex font-sans">
            {/***
             * Sidebar (fixed)
             * ----------------
             * Collapsible sidebar, fixed to the left of the screen.
             * Transitions smoothly between collapsed and expanded states.
             ***/}
            <aside
                className={`fixed top-0 left-0 h-screen ${sidebarWidth} transition-all duration-300 bg-base-100 shadow z-40`}
            >
                <Sidebar
                    collapsed={sidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                    setCollapsed={setSidebarCollapsed}
                />
            </aside>

            {/***
             * Main wrapper
             * ----------------
             * Contains TopBar (fixed) and scrollable content area.
             * Adjusts padding-left based on sidebar width to avoid overlap.
             ***/}
            <div
                className={`flex flex-col min-h-screen w-full ${
                    sidebarCollapsed ? "pl-16" : "pl-44"
                }`}
            >
                {/***
                 * TopBar (fixed)
                 * ----------------
                 * Stays at the top of the page.
                 * z-index ensures it sits above content and sidebar.
                 ***/}
                <header className="fixed top-0 right-0 left-0 h-12 z-50 bg-base-100">
                    <meta name="csrf-token" content="{{ csrf_token() }}" />
                    <TopBar />
                </header>

                {/***
                 * Scrollable main content
                 * ----------------
                 * Scrolls independently of the TopBar and Sidebar.
                 * Padding-top accounts for fixed TopBar height.
                 ***/}
                <section className="flex-1 overflow-y-auto bg-base-100 pb-4 pt-16">
                    {children}
                </section>
            </div>
        </main>
    );
}

import React from "react";
import MetaData from "@/Components/Root/MetaData";
import Navbar from "@/Components/Website/Partials/Navbar";
import "@css/app.css";
import Footer from "./Partials/Footer";

/**
 * @component WebsiteLayout
 * @description
 * The main layout component for the public-facing website pages.
 * It provides a consistent structure including metadata handling, navigation bar,
 * and a centered content section with responsive padding.
 *
 * This layout wraps all website pages that are not part of the authenticated/admin area.
 * It applies a neutral background (bg-base-100) to the entire page and centers the main content
 * within a maximum width of 7xl with appropriate horizontal padding.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The main content of the page (page component).
 * @param {string} [props.metaTitle] - The title to be used in the <title> tag and meta data.
 *
 * @example
 * <WebsiteLayout metaTitle="Home Page">
 *   <HomePageContent />
 * </WebsiteLayout>
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function WebsiteLayout({ children, metaTitle }) {
    return (
        <main className="bg-base-100">
            <MetaData metaTitle={metaTitle} />
            <Navbar />
            {/* <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24"> */}
                {children}
            {/* </section> */}
            <Footer/>

        </main>
    );
}

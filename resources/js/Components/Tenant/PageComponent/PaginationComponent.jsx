import { Link, router } from "@inertiajs/react";
import React, { useState, useEffect } from "react";
import { useTranslations } from "@/hooks/useTranslations";

/**
 * PaginationComponent
 *
 * Renders pagination controls with previous/next buttons,
 * page input, and display of currently shown results.
 *
 * @param {Object} props
 * @param {number} props.from - Starting item number on the current page
 * @param {number} props.to - Ending item number on the current page
 * @param {number} props.total - Total number of items
 * @param {Array} props.links - Array of pagination links (from backend)
 * @param {number} props.current_page - Current page number
 * @param {number} props.last_page - Last page number
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function PaginationComponent({
    from = 0,
    to = 0,
    total = 0,
    links = [],
    current_page = 1,
    last_page = 1,
}) {
    const __ = useTranslations();
    const [pageInput, setPageInput] = useState(current_page);

    /**
     * Navigate to the page specified in the input.
     */
    const goToPage = () => {
        if (pageInput >= 1 && pageInput <= last_page) {
            const pageLink = links.find(
                (link) => link.label === `${pageInput}`
            );
            if (pageLink?.url) router.visit(pageLink.url);
        }
    };

    /**
     * Handles page input change with clamping between 1 and last_page.
     * @param {React.ChangeEvent<HTMLInputElement>} e
     */
    const handlePageInputChange = (e) => {
        const value = Number(e.target.value);
        setPageInput(value < 1 ? 1 : value > last_page ? last_page : value);
    };

    /* Determine previous and next links */
    const prevLink = links[0]?.url || null;
    const nextLink = links[links.length - 1]?.url || null;

    return (
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between mt-6 gap-4">
            {/* Showing Results */}
            <div className="text-sm text-gray-500 flex flex-wrap items-center gap-1">
                <span>{__("Showing")}</span>
                <span className="font-semibold text-gray-700">{from}</span>
                <span>{__("To")}</span>
                <span className="font-semibold text-gray-700">{to}</span>
                <span>{__("Of")}</span>
                <span className="font-semibold text-brandColor">{total}</span>
                <span>{__("Entries")}</span>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center flex-wrap gap-2">
                {/* Previous Button */}
                <Link
                    href={prevLink || "#"}
                    className={`px-3 py-1 text-sm rounded-md border transition ${
                        prevLink
                            ? "text-brandColor border-brandColor hover:bg-brandColor hover:text-white"
                            : "text-gray-400 bg-white border-gray-300 cursor-not-allowed"
                    }`}
                >
                    {__("Previous")}
                </Link>

                {/* Page Input */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{__("Page")}</span>
                    <input
                        type="number"
                        min={1}
                        max={last_page}
                        value={pageInput}
                        onChange={handlePageInputChange}
                        className="w-16 px-2 py-1 text-center text-sm border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brandColor"
                    />
                    <span className="text-sm text-gray-500">
                        {__("Of")} {last_page}
                    </span>
                    <button
                        onClick={goToPage}
                        className="px-3 py-1 text-sm text-white bg-brandColor border border-brandColor rounded-md hover:bg-brandColor/90 transition"
                    >
                        {__("Go")}
                    </button>
                </div>

                {/* Next Button */}
                <Link
                    href={nextLink || "#"}
                    className={`px-3 py-1 text-sm rounded-md border transition ${
                        nextLink
                            ? "text-brandColor border-brandColor hover:bg-brandColor hover:text-white"
                            : "text-gray-400 bg-white border-gray-300 cursor-not-allowed"
                    }`}
                >
                    {__("Next")}
                </Link>
            </div>
        </div>
    );
}

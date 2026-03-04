import React from "react";
import { useTranslations } from "@/hooks/useTranslations";
import ButtonComponent from "@/Components/ButtonComponent";
import FilterResetButtonComponent from "@/Components/Tenant/Buttons/FilterResetButtonComponent";

/**
 * FilterFormComponent
 *
 * A reusable form component for filtering data. Supports multiple select filters,
 * text search, and action buttons (Filter & Reset). The layout is responsive
 * with grid columns adapting from mobile to large screens.
 *
 * @param {Object} props - Component properties
 * @param {Object} props.data - Current filter values
 * @param {Array} props.filterInputs - List of filter definitions:
 *   Each filter object should have `name` and `options` (array of { optValue, optLabel })
 * @param {boolean} props.processing - Indicates if form submission is in progress
 * @param {Function} props.handleSubmit - Function to call on form submission
 * @param {Function} props.handleFilterChange - Function to call on filter input change
 * @param {string} [props.resetLink=""] - Optional link for the reset button
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function FilterFormComponent({
    data,
    filterInputs,
    processing,
    handleSubmit,
    handleFilterChange,
    resetLink = "",
}) {
    const __ = useTranslations();

    return (
        <div className="pb-3">
            <form
                onSubmit={handleSubmit}
                className="w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-0 bg-base-200 rounded-lg p-3"
            >
                {/**
                 * Render select inputs dynamically based on filterInputs prop
                 */}
                {filterInputs.map(({ name, options, component }) => (
                    <div key={name} className="w-full">
                        {/* If it has options => render SELECT */}
                        {options && (
                            <select
                                name={name}
                                className="select select-sm w-full text-sm border border-base-300 bg-base-100 focus:ring-red-400 focus:outline-brandColor"
                                value={data[name] ?? ""}
                                onChange={handleFilterChange}
                            >
                                {options.map(
                                    ({ optValue, optLabel }, index) => (
                                        <option
                                            value={optValue}
                                            key={`${name}_${index}`}
                                        >
                                            {optLabel}
                                        </option>
                                    )
                                )}
                            </select>
                        )}

                        {/* If it has component => render INPUT */}
                        {component && component(handleFilterChange, data)}
                    </div>
                ))}

                {/**
                 * Text search input
                 */}
                {/* <div className="w-full">
                    <label className="input input-sm rounded-box flex items-center gap-2 bg-base-100 border border-base-300">
                        <input
                            type="search"
                            className="grow text-sm bg-transparent focus:outline-none"
                            name="textSearch"
                            placeholder={`${__("Text search")} ...`}
                            value={data.textSearch ?? ""}
                            onChange={handleFilterChange}
                        />
                    </label>
                </div> */}

                {/**
                 * Action buttons: Filter and optional Reset
                 */}
                <div className="w-full flex items-center gap-2">
                    <ButtonComponent
                        type="submit"
                        icon="filter"
                        text="Filter"
                        loading={processing}
                        className="btn btn-sm flex-1 bg-brandColor text-white border border-base-300 rounded-lg"
                    />
                    {resetLink && (
                        <FilterResetButtonComponent
                            link={resetLink}
                            className="flex-1"
                        />
                    )}
                </div>
            </form>
        </div>
    );
}

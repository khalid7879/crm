import React from "react";
import { usePage } from "@inertiajs/react";
import IconComponent from "@/Components/IconComponent";
import { useTranslations } from "@/hooks/useTranslations";
import { _subString } from "@/utils/common/helpers";

/**
 * OverviewComponent
 *
 * Displays key overview statistics and metadata for a given model.
 * Left section shows statistical cards, right section shows model avatar/info and associated persons.
 *
 * @param {Object} modelData - Primary model data (name, summary, timestamps, etc.)
 * @param {Array} overviewStats - List of stat objects { icon?, label, value, summary, color? }
 * @param {Array} associatedPersons - Array of persons { name, email, avatar? }
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function OverviewComponent({
    modelData,
    overviewStats = [],
    associatedPersons = [],
}) {
    const __ = useTranslations();
    const { staticImages } = usePage().props;

    return (
        <div
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
            id="sectionContainer"
        >
            {/* Overview Section */}
            <div
                id="overview"
                className="col-span-1 md:col-span-2 lg:col-span-3 "
            >
                <div className="border-1 border-gray-300 rounded-md grid grid-cols-1 lg:grid-cols-2 gap-4 ">
                    {overviewStats.map((stat, i) => (
                        <div key={i} className="stat">
                            {stat?.icon && (
                                <div
                                    className={`stat-figure ${
                                        stat?.color || ""
                                    }`}
                                >
                                    <IconComponent
                                        icon={stat?.icon}
                                        classList="text-5xl text-gray-400/50"
                                    />
                                </div>
                            )}
                            <div className="stat-title">{__(stat?.label)}</div>

                            <div className="stat-value">
                                <div className="font-bold text-xl text-gray-500">
                                    {_subString(stat?.value, 25)}
                                </div>
                            </div>

                            {stat?.link ? (
                                <a className="stat-desc" href={stat?.link}>
                                    {_subString(stat?.summary, 45)}
                                </a>
                            ) : (
                                <div className="stat-desc">
                                    {_subString(stat?.summary, 45)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Right metadata section */}
            <div id="sectionRight" className="col-span-1 space-y-3">
                <div
                    id="metadata"
                    className="card bg-base-100 border-1 border-gray-300 rounded-md pt-3"
                >
                    <div className="flex justify-center items-center ">
                        <figure className="w-20 h-20 rounded-full border border-primary-content p-2">
                            <img
                                src={staticImages?.favicon}
                                alt="icon"
                                className="h-16 w-auto object-contain"
                            />
                        </figure>
                    </div>
                    <div className="card-body p-3">
                        <p className="backdrop-blur-md bg-gray-200/00 border-1 border-b-2 border-t-2 border-brandColor/50 border-l-gray-300/80 border-r-gray-300/80 rounded-lg py-2">
                            <span
                                className={`block w-full text-center font-semibold text-brandColor ${
                                    modelData?.details
                                        ? "border-b-1 border-gray-200 pb-2"
                                        : ""
                                }`}
                            >
                                {modelData?.name}
                            </span>
                            {modelData?.summary && (
                                <span
                                    data-tip={modelData?.details}
                                    className="block text-gray-500 text-xs px-4 py-2 tooltip tooltip-left tooltip-secondary"
                                >
                                    {modelData?.summary}
                                </span>
                            )}
                        </p>

                        <p>
                            <span>{__("Created at")}:</span>{" "}
                            {modelData?.created_at}
                        </p>
                        <p>
                            <span>{__("Last modified")}:</span>{" "}
                            {modelData?.updated_at}
                        </p>
                    </div>
                </div>

                <div
                    id="associates"
                    className="card bg-base-100 border border-gray-300 rounded-md p-3"
                >
                    <h3 className="text-sm font-semibold text-gray-600 pb-2 border-b border-b-gray-100 mb-0 text-center">
                        {__("Associated persons")}
                    </h3>

                    <ul className="list bg-base-100 rounded-box">
                        {associatedPersons.map((item, idx) => (
                            <li
                                key={idx}
                                className="list-row flex items-center gap-3 py-2 px-0"
                            >
                                {item.avatar ? (
                                    <figure className="w-10 h-10 rounded-full border border-primary-content p-2">
                                        <img
                                            src={staticImages?.favicon}
                                            alt="icon"
                                            className="h-8 w-auto object-contain"
                                        />
                                    </figure>
                                ) : (
                                    <IconComponent
                                        icon="userCircleFill"
                                        classList="text-4xl text-gray-400/50"
                                    />
                                )}

                                <div className="text-left">
                                    <div className="font-medium">
                                        {item.name}
                                    </div>
                                    <div className="text-xs lowercase font-semibold opacity-60">
                                        {item.email}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

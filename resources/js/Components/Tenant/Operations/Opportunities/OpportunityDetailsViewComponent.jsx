import React from "react";
import IconComponent from "@/Components/IconComponent";
import { useTranslations } from "@/hooks/useTranslations";

export default function OpportunityDetailsViewComponent({
    modelData,
    overviewStats = [],
    associatedPersons = [],
}) {
    const __ = useTranslations();

    return (
        <div
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
            id="sectionContainer"
        >
            {/* Left Section: Stats */}
            <div
                id="overview"
                className="col-span-1 md:col-span-2 lg:col-span-3 "
            >
                <div className="border-1 border-gray-300 rounded-md grid grid-cols-1 lg:grid-cols-2 gap-4 ">
                    {overviewStats.map((stat, i) => (
                        <div key={i} className="stat">
                            {stat.icon && (
                                <div
                                    className={`stat-figure ${
                                        stat.color || ""
                                    }`}
                                >
                                    <IconComponent
                                        icon={stat.icon}
                                        classList="text-5xl text-gray-400/50"
                                    />
                                </div>
                            )}
                            <div className="stat-title">{stat.label}</div>
                            <div className={`font-bold text-xl text-gray-500`}>
                                {stat.value}
                            </div>
                            {stat.link ? (
                                <div className="stat-desc">
                                    <a className="" href={stat.link}>
                                        {stat.summary}
                                    </a>
                                </div>
                            ) : (
                                <div className="stat-desc">{stat.summary}</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Section: List */}
            <div id="sectionRight" className="col-span-1 space-y-3">
                <div
                    id="metadata"
                    className="card bg-base-100 border-1 border-gray-300 rounded-md pt-3"
                >
                    <figure className="">
                        <img
                            className="w-20 h-20 rounded-full"
                            src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
                            alt="Shoes"
                        />
                    </figure>
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
                            {modelData?.details && (
                                <span className="block text-gray-500 text-xs px-4 py-2">
                                    {modelData?.details}
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
                                    <img
                                        className="w-14 h-14 rounded-full"
                                        src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
                                        alt={item.title}
                                    />
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
                                    <div className="text-xs uppercase font-semibold opacity-60">
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

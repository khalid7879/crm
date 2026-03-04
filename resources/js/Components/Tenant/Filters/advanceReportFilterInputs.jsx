import React, { useState } from "react";

import Select from "react-select";

export const PER_PAGE = ({ __ }) => {
    return {
        name: "perPage",
        label: "Per page show",
        options: [
            {
                optValue: 10,
                optLabel: __("10"),
            },
            {
                optValue: 25,
                optLabel: __("25"),
            },
            {
                optValue: 50,
                optLabel: __("50"),
            },
            {
                optValue: 100,
                optLabel: __("100"),
            },
            {
                optValue: 250,
                optLabel: __("250"),
            },
        ],
    };
};

export const ORDER_BY = ({ __ = {}, optValues = null }) => {
    const options = [
        {
            optValue: "id",
            optLabel: __("Id"),
        },
        {
            optValue: "created_at",
            optLabel: __("Created at"),
        },
        {
            optValue: "updated_at",
            optLabel: __("Updated at"),
        },
        {
            optValue: "is_active",
            optLabel: __("Active status"),
        },
    ];

    if (Array.isArray(optValues) && optValues.length > 0) {
        const selectedOptions = options.filter((option) =>
            optValues.includes(option.optValue)
        );
        return selectedOptions.length > 0
            ? { name: "orderBy", options: selectedOptions }
            : null;
    }

    return { name: "orderBy", label: "Order by", options };
};

export const ORDER_TYPE = ({ __ = {} }) => {
    return {
        name: "orderType",
        label: "Order type",
        options: [
            {
                optValue: "asc",
                optLabel: __("Ascending"),
            },
            {
                optValue: "desc",
                optLabel: __("Descending"),
            },
        ],
    };
};

export const IS_ACTIVE = ({ __ = {} }) => {
    return {
        name: "isActive",
        label: "Active status",
        options: [
            {
                optValue: "",
                optLabel: __("Default"),
            },
            {
                optValue: "1",
                optLabel: __("Active"),
            },
            {
                optValue: "0",
                optLabel: __("Inactive"),
            },
        ],
    };
};

export const IS_VERIFIED = ({ __ = {} }) => {
    return {
        name: "isVerified",
        options: [
            {
                optValue: "",
                optLabel: __("Default"),
            },
            {
                optValue: "1",
                optLabel: __("Verified"),
            },
            {
                optValue: "0",
                optLabel: __("Unverified"),
            },
        ],
    };
};
export const FILTER_DATE_FIELD = ({ __ = {} }) => {
    return {
        name: "dateField",
        label: "Date field",
        options: [
            {
                optValue: "DATE_CREATED",
                optLabel: __("Created"),
            },
            {
                optValue: "DATE_UPDATED",
                optLabel: __("Updated"),
            },
        ],
    };
};
export const OWNER = ({ __ = {} }, tenantUsers = []) => {
    return {
        name: "owner",
        label: "Owner",
        options: [
            {
                optValue: "ALL",
                optLabel: __("Select owner"),
            },
            ...tenantUsers.map((user) => ({
                optValue: user?.value,
                optLabel: user?.label,
            })),
        ],
    };
};

export const START_DATE = ({ __ = {} }) => {
    return {
        name: "startDate",
        component: (handleFilterChange, data) => (
            <div>
                <label className="block mb-1 text-sm font-medium">
                    Start date
                </label>
                <input
                    type="date"
                    name="startDate"
                    value={data.startDate}
                    onChange={handleFilterChange}
                    className="input input-sm w-full border border-base-300 bg-base-100"
                />
            </div>
        ),
    };
};

export const END_DATE = ({ __ = {} }) => {
    return {
        name: "endDate",
        component: (handleFilterChange, data) => (
            <div>
                <label className="block mb-1 text-sm font-medium">
                    End date
                </label>
                <input
                    type="date"
                    name="endDate"
                    value={data.endDate}
                    onChange={handleFilterChange}
                    className="input input-sm w-full border border-base-300 bg-base-100"
                />
            </div>
        ),
    };
};
export const CLOSE_DATE = ({ __ = {} }) => {
    return {
        name: "closeDate",
        component: (handleFilterChange, data) => (
            <div>
                <label className="block mb-1 text-sm font-medium">
                    Close date
                </label>
                <input
                    type="date"
                    name="closeDate"
                    value={data.closeDate}
                    onChange={handleFilterChange}
                    className="input input-sm w-full border border-base-300 bg-base-100"
                />
            </div>
        ),
    };
};
export const OVERDUE_DATE = ({ __ = {} }) => {
    return {
        name: "overdueDate",
        component: (handleFilterChange, data) => (
            <div>
                <label className="block mb-1 text-sm font-medium">
                    Overdue date
                </label>
                <input
                    type="date"
                    name="overdueDate"
                    value={data.overdueDate}
                    onChange={handleFilterChange}
                    className="input input-sm w-full border border-base-300 bg-base-100"
                />
            </div>
        ),
    };
};

export const OVERDUE_STATUS = ({ __ = {} }) => {
    return {
        name: "overdueStatus",
        label: "Overdue",
        options: [
            {
                optValue: "",
                optLabel: __("Default"),
            },
            {
                optValue: "WITH_OUT_OVERDUE",
                optLabel: __("With out overdue"),
            },
            {
                optValue: "ONLY_OVERDUE",
                optLabel: __("Only overdue"),
            },
        ],
    };
};

export const DATA_SOURCE = ({ __ = {} }, dataSources = []) => {
    return {
        name: "dataSource",
        label: "Source",
        options: [
            {
                optValue: "",
                optLabel: __("Select source"),
            },
            ...dataSources.map((source) => ({
                optValue: source?.value,
                optLabel: source?.label,
            })),
        ],
    };
};
export const STAGE = ({ __ = {} }, stages = []) => {
    return {
        name: "stage",
        label: "Stage",
        options: [
            {
                optValue: "",
                optLabel: __("Select stage"),
            },
            ...stages.map((stage) => ({
                optValue: stage?.value,
                optLabel: stage?.label,
            })),
        ],
    };
};

export const OPPORTUNITY_VALUE = ({ __ = {} }) => {
    return {
        name: "opportunityValue",
        label: "Opportunity value type",
        options: [
            {
                optValue: "",
                optLabel: __("All"),
            },
            {
                optValue: "HIGH",
                optLabel: __("High"),
            },
            {
                optValue: "LOW",
                optLabel: __("Low"),
            },
        ],
    };
};
export const DATA_PRIORITY = ({ __ = {} }, dataPriorities = []) => {
    return {
        name: "dataPriority",
        label: "Priority",
        options: [
            {
                optValue: "",
                optLabel: __("Select priority"),
            },
            ...dataPriorities.map((priority) => ({
                optValue: priority?.value,
                optLabel: priority?.label,
            })),
        ],
    };
};
export const DATA_RATING = ({ __ = {} }, dataRatings = []) => {
    return {
        name: "dataRating",
        label: "Rating",
        options: [
            {
                optValue: "",
                optLabel: __("Select rating"),
            },
            ...dataRatings.map((rating) => ({
                optValue: rating?.value,
                optLabel: rating?.label,
            })),
        ],
    };
};
export const DATA_CATEGORY = ({ __ = {} }, dataCategories = []) => {
    return {
        name: "dataCategory",
        label: "Category",
        options: [
            {
                optValue: "",
                optLabel: __("Select category"),
            },
            ...dataCategories.map((category) => ({
                optValue: category?.value,
                optLabel: category?.label,
            })),
        ],
    };
};
export const DATA_TAG = ({ __ = {} }, dataTags = []) => {
    return {
        name: "dataTag",
        label: "Tag",
        options: [
            {
                optValue: "",
                optLabel: __("Select tag"),
            },
            ...dataTags.map((tag) => ({
                optValue: tag?.value,
                optLabel: tag?.label,
            })),
        ],
    };
};

export const CUSTOM_COLUMN = (
    { __ = {} },
    allColumns = [],
    defaultColumns = []
) => {
    const flatColumns = allColumns.flat();

    const options = flatColumns.map((column) => ({
        value: column.key,
        label: column.label,
    }));

    const selectedValues = options.filter((opt) =>
        defaultColumns.some((col) => col.key === opt.value)
    );

    return {
        name: "customColumn",
        customColumnComponent: ({ handleOnChange, data }) => {
            const valueForSelect =
                data?.length > 0
                    ? data
                          .map((d) => options.find((o) => o.value === d.key))
                          .filter(Boolean)
                    : selectedValues;

            return (
                <div>
                    <label>Custom column</label>

                    <Select
                        isMulti
                        options={options}
                        value={valueForSelect}
                        onChange={handleOnChange}
                        menuPlacement="auto"
                    
                    />
                </div>
            );
        },
    };
};



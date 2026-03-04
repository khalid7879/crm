import React from "react";
export const PER_PAGE = ({ __ }) => {
    return {
        name: "perPage",
        options: [
            {
                optValue: 10,
                optLabel: __("Showing10"),
            },
            {
                optValue: 25,
                optLabel: __("Showing25"),
            },
            {
                optValue: 50,
                optLabel: __("Showing50"),
            },
            {
                optValue: 100,
                optLabel: __("Showing100"),
            },
            {
                optValue: 250,
                optLabel: __("Showing250"),
            },
        ],
    };
};

export const ORDER_BY = ({ __ = {}, optValues = null }) => {
    const options = [
        {
            optValue: "id",
            optLabel: __("Orderby") + " : " + __("Id"),
        },
        {
            optValue: "created_at",
            optLabel: __("Orderby") + " : " + __("Created at"),
        },
        {
            optValue: "updated_at",
            optLabel: __("Orderby") + " : " + __("Updated at"),
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

    return { name: "orderBy", options };
};

export const ORDER_TYPE = ({ __ = {} }) => {
    return {
        name: "orderType",
        options: [
            {
                optValue: "asc",
                optLabel: __("Order type") + " : " + __("Ascending"),
            },
            {
                optValue: "desc",
                optLabel: __("Order type") + " : " + __("Descending"),
            },
        ],
    };
};

export const IS_ACTIVE = ({ __ = {} }) => {
    return {
        name: "isActive",
        options: [
            {
                optValue: "",
                optLabel: __("Status") + " : " + __("Default"),
            },
            {
                optValue: "1",
                optLabel: __("Status") + " : " + __("Active"),
            },
            {
                optValue: "0",
                optLabel: __("Status") + " : " + __("Inactive"),
            },
        ],
    };
};

export const GENDER = ({ __ = {} }) => {
    return {
        name: "gender",
        options: [
            {
                optValue: "",
                optLabel: __("Gender") + " : " + __("Default"),
            },
            {
                optValue: "MALE",
                optLabel: __("Gender") + " : " + __("Male"),
            },
            {
                optValue: "FEMALE",
                optLabel: __("Gender") + " : " + __("Female"),
            },
            {
                optValue: "OTHERS",
                optLabel: __("Gender") + " : " + __("Others"),
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
                optLabel: __("Verified status") + " : " + __("Default"),
            },
            {
                optValue: "1",
                optLabel: __("Verified status") + " : " + __("Verified"),
            },
            {
                optValue: "0",
                optLabel: __("Verified status") + " : " + __("Unverified"),
            },
        ],
    };
};
export const FILTER_DATE_FIELD = ({ __ = {} }) => {
    return {
        name: "dateField",
        options: [
            {
                optValue: "DATE_CREATED",
                optLabel: __("Date field") + " : " + __("Date created"),
            },
            {
                optValue: "DATE_UPDATED",
                optLabel: __("Date field") + " : " + __("Date updated"),
            },
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


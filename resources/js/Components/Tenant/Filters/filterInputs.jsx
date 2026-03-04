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

export const ORDER_BY = ({ __ = {}, optValues = null}) => {
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
            optValue: "name",
            optLabel: __("Orderby") + " : " + __("Name"),
        },
        {
            optValue: "email",
            optLabel: __("Orderby") + " : " + __("Email"),
        },
        {
            optValue: "mobile",
            optLabel: __("Orderby") + " : " + __("Mobile"),
        },
        {
            optValue: "gender",
            optLabel: __("Orderby") + " : " + __("Gender"),
        },

        {
            optValue: "updated_at",
            optLabel: __("Orderby") + " : " + __("Updated at"),
        },
        {
            optValue: "body",
            optLabel: __("Orderby") + " : " + __("Details"),
        },
        {
            optValue: "is_active",
            optLabel: __("Orderby") + " : " + __("Active status"),
        },
        {
            optValue: "nickname",
            optLabel: __("Orderby") + " : " + __("Nickname"),
        },
        {
            optValue: "first_name",
            optLabel: __("Orderby") + " : " + __("First name"),
        },
        {
            optValue: "telephone",
            optLabel: __("Orderby") + " : " + __("Telephone"),
        },
        {
            optValue: "mobile_phone",
            optLabel: __("Orderby") + " : " + __("Mobile phone"),
        },
        {
            optValue: "fax",
            optLabel: __("Orderby") + " : " + __("Fax"),
        },
        {
            optValue: "website",
            optLabel: __("Orderby") + " : " + __("Website"),
        },
        {
            optValue: "details",
            optLabel: __("Orderby") + " : " + __("Details"),
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

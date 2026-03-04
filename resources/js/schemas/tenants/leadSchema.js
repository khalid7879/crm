import Joi from "joi";

export const LeadSchema = function (__) {
    return Joi.object().keys({
        first_name: Joi.string()
            .allow("")
            .max(50)
            .messages({
                "string.max": __("Maximum character length", { max: 50 }),
            }),

        last_name: Joi.string()
            .allow("")
            .max(50)
            .messages({
                "string.max": __("Maximum character length", { max: 50 }),
            }),

        nickname: Joi.string()
            .min(1)
            .max(50)
            .required()
            .messages({
                "string.empty": __("Nickname can not be empty"),
                "string.min": __("Minimum character length", { min: 1 }),
                "string.max": __("Maximum character length", { max: 50 }),
                "any.required": __("Field is required"),
            }),

        organization: Joi.string()
            .allow("")
            .max(500)
            .messages({
                "string.max": __("Maximum character length", { max: 500 }),
            }),

        email: Joi.string()
            .allow("")
            .min(5)
            .max(100)
            .email({ tlds: { allow: false } })
            .messages({
                "string.min": __("Minimum character length", { min: 5 }),
                "string.max": __("Maximum character length", { max: 100 }),
                "string.email": __("Must be a valid email"),
            }),

        telephone: Joi.string()
            .allow("")
            .max(100)
            .messages({
                "string.max": __("Maximum character length", { max: 100 }),
            }),

        mobile_phone: Joi.string()
            .allow("")
            .pattern(/^[0-9]+$/)
            .min(5)
            .max(20)
            .messages({
                "string.pattern.base": __("Mobile number must contain digits only (0–9)"),
                "string.min": __("Minimum character length", { min: 5 }),
                "string.max": __("Maximum character length", { max: 20 }),
            }),


        alt_mobile_phone: Joi.string()
            .allow("")
            .pattern(/^[0-9]+$/)
            .min(5)
            .max(20)
            .messages({
                "string.pattern.base": __("Mobile number must contain digits only (0–9)"),
                "string.min": __("Minimum character length", { min: 5 }),
                "string.max": __("Maximum character length", { max: 100 }),
            }),

        fax: Joi.string()
            .allow("")
            .max(100)
            .messages({
                "string.max": __("Maximum character length", { max: 100 }),
            }),

        website: Joi.string()
            .allow("")
            .uri()
            .messages({
                "string.uri": __("Must be a valid url"),
            }),
    });
};

export const ValidationAttributes = function (states, dataSocial = []) {
    return {
        first_name: states.first_name,
        last_name: states.last_name,
        nickname: states.nickname,
        organization: states.organization,
        email: states.email,
        telephone: states.telephone,
        mobile_phone: states.mobile_phone,
        alt_mobile_phone: states.alt_mobile_phone,
        fax: states.fax,
        website: states.website,
    };
};

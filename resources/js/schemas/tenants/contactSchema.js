import Joi from "joi";

export const ContactSchema = function (__) {
    return Joi.object().keys({
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
    });
};

export const ValidationAttributes = function (states, dataSocial = []) {
    return {
        nickname: states.nickname,
    };
};

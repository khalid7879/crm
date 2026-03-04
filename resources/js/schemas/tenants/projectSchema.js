import Joi from "joi";

export const ProjectSchema = function (__) {
    return Joi.object().keys({
        name: Joi.string()
            .allow("")
            .max(50)
            .messages({
                "string.max": __("Maximum character length", { max: 50 }),
            }),
    });
};

export const ValidationAttributes = function (states, dataSocial = []) {
    return {
        name: states.name,
    };
};

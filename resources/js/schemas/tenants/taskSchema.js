import Joi from "joi";

export const TaskSchema = function (__) {
    return Joi.object().keys({
        name: Joi.string()
            .allow("")
            .max(300)
            .messages({
                "string.max": __("Maximum character length", { max: 300 }),
            }),
    });
};

export const ValidationAttributes = function (states, dataSocial = []) {
    return {
        name: states.name,
    };
};

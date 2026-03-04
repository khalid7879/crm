import Joi from "joi";
export const TenantDepartmentSchema = function (__) {
    return Joi.object({
        name: Joi.string()
        .min(3)
        .max(50)
        .required()
        .messages({
            "string.empty": __("Name can not be empty"),
            "string.min": __("Minimum character length",{ min: 3 }),
            "string.max": __("Maximum character length",{max:50}),
        }),
    });
};
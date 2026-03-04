import Joi from "joi";
export const TenantIndustryTypeSchema = function (__) {
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
        types: Joi.array()
        .items(Joi.string().min(1)) 
        .min(1)
        .required()
        .messages({
            "any.required": __("Type field is required"),
            "array.min": __("At least one type must be selected"),
        }),
    });
};
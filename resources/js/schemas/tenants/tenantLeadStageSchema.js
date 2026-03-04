import Joi from "joi";
export const TenantLeadStageSchema = function (__) {
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
         label: Joi.string()
        .min(3)
        .max(50)
        .required()
        .messages({
            "string.empty": __("Label can not be empty"),
            "string.min": __("Minimum character length",{ min: 3 }),
            "string.max": __("Maximum character length",{max:50}),
        }),
        stage_percent: Joi.string()
        .min(1)
        .max(3)
        .required()
         .messages({
            "string.empty": __("Percentage  can not be empty"),
            "string.min": __("Minimum character length",{ min: 3 }),
            "string.max": __("Maximum hours length is {#limit} "),
        }),
        types: Joi.array()
        .items(Joi.string().min(1)) 
        .min(1)
        .required()
        .messages({
            "any.required": __("Type field is required"),
            "array.min": __("At least one type must be selected"),
        }),
        resolution_days: Joi.string()
        .min(1)
         .max(3)
        .required()
        .messages({
            "string.empty": __("Resolution days is required"),
            "string.min": __("Minimum hours length is {#limit} "),
            "string.max": __("Maximum hours length is {#limit} "),
        }),
        resolution_hours: Joi.string()
        .min(1)
        .max(3)
        .required()
        .messages({
           "string.empty": __("Resolution hours is required"),
           "string.min": __("Minimum hours length is {#limit} "),
            "string.max": __("Maximum hours length is {#limit} "),
        }),
         
    });
};
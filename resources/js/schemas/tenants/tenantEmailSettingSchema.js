import Joi from "joi";
export const TenantEmailSettingSchema = function (__) {
    return Joi.object({
        host: Joi.string()
        .required()
        .messages({
            "string.empty": __("Host can not be empty"),
        }),
        port: Joi.string()
        .required()
        .messages({
            "string.empty": __("Port can not be empty"),
        }),
        password: Joi.string()
        .required()
        .messages({
            "string.empty": __("Password can not be empty"),
        }),
        encryption: Joi.string()
        .required()
        .messages({
            "string.empty": __("Encryption can not be empty"),
        }),
        userName: Joi.string()
        .required()
        .messages({
            "string.empty": __("User name can not be empty"),
        }),
        mailFromAddress: Joi.string()
        .required()
        .messages({
            "string.empty": __("Mail address can not be empty"),
        }),
    });
};
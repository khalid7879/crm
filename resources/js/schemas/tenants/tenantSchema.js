import Joi from "joi";
/**
 * Joi schema for tenant registration validation.
 *
 * Validates the following fields:
 * - email: A valid email string between 5 and 100 characters.
 * - password: A string between 8 and 20 characters, containing at least one uppercase letter,
 *   one lowercase letter, one number, and one special character.
 * - company: A required string up to 50 characters.
 *
 * @param {Function} __ - Translation function for internationalization of error messages.
 * @returns {Joi.ObjectSchema} The Joi validation schema for tenant registration.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export const TenantRegisterSchema = function (__) {
    return Joi.object({
        email: Joi.string()
            .email({ tlds: { allow: false } }) /* skip domain checking */
            .min(5)
            .max(100)
            .required()
            .messages({
                "string.email": __("Must be a valid email"),
                "string.empty": __("Must be a valid email"),
                "string.min": __("Minimum character length", { min: 5 }),
                "string.max": __("Maximum character length", { max: 100 }),
                "any.required": __("Must be a valid email"),
            }),

        password: Joi.string()
            .required()
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/) // remove {8,20} from regex
            .min(8)
            .max(20)
            .messages({
                "string.empty": __("Password can not be empty"),
                "any.required": __("Password can not be empty"),
                "string.min": __(
                    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
                ),
                "string.max": __(
                    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
                ),
                "string.pattern.base": __(
                    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
                ),
            }),
        company: Joi.string()
            .required()
            .max(50)
            .messages({
                "string.empty": __("Company name can not be empty"),
                "string.max": __("Maximum character length", { max: 50 }),
            }),
    });
};

export const TenantEmailVerifySchema = function (__) {
    return Joi.object({
        verifyToken: Joi.string()
            .required()
            .length(6)
            .messages({
                "string.empty": __("Field can not be empty"),
                "string.length": __("Must be exactly :size characters", {
                    size: 6,
                }),
            }),
        email: Joi.string()
            .required()
            .messages({
                "string.empty": __("Must be a valid email"),
            }),
    });
};

/**
 * Joi schema for tenant user authentication validation.
 *
 * Validates the following fields:
 * - email: A valid email string between 5 and 100 characters.
 * - password: A string between 8 and 20 characters, containing at least one uppercase letter,
 *   one lowercase letter, one number, and one special character.
 *
 * @param {Function} __ - Translation function for internationalization of error messages.
 * @returns {Joi.ObjectSchema} The Joi validation schema for tenant authentication.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export const TenantLoginSchema = function (__) {
    return Joi.object({
        email: Joi.string()
            .email({ tlds: { allow: false } }) /* skip domain checking */
            .min(5)
            .max(100)
            .required()
            .messages({
                "string.email": __("Must be a valid email"),
                "string.empty": __("Must be a valid email"),
                "string.min": __("Minimum character length", { min: 5 }),
                "string.max": __("Maximum character length", { max: 100 }),
                "any.required": __("Must be a valid email"),
            }),

        password: Joi.string()
            .required()
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/) // remove {8,20} from regex
            .min(8)
            .max(20)
            .messages({
                "string.empty": __("Field can not be empty"),
                "any.required": __("Field can not be empty"),
                "string.min": __("Password must be at least 8 characters long"),
                "string.max": __("Password must not exceed 20 characters"),
                "string.pattern.base": __(
                    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
                ),
            }),
    });
};

/**
 * @component
 * Tenant User Registration/Edit Validation Schema
 *
 * @description
 * This function generates a Joi validation schema for tenant user creation or editing.
 * It validates the core fields: name, email, and role.
 * - On create (isInsert = true): enforces all fields as required.
 * - On edit (isInsert = false): same rules apply since name/email/role are always required.
 * Password validation is intentionally excluded here as it's handled separately
 * (e.g., only required on create or when explicitly changed on edit).
 *
 * The role field supports both single string (for single select) and array of strings
 * (for multi-select), but must have at least one role selected.
 *
 * @param {Function} __ - Translation function (defaults to identity if not provided)
 * @param {boolean} [isInsert=true] - Whether this is for user creation (true) or edit (false)
 * @returns {Joi.ObjectSchema} Joi validation schema object
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author Mamun <mamunhossen149191@gmail.com>
 */
export const TenantUserRegisterSchema = (__ = () => "", isInsert = true) => {
    const baseSchema = {
        name: Joi.string()
            .trim()
            .min(3)
            .max(50)
            .required()
            .messages({
                "any.required": __(
                    "Input your name in between 5 to 50 characters"
                ),
                "string.empty": __(
                    "Input your name in between 5 to 50 characters"
                ),
                "string.min": __("Minimum character length", { min: 5 }),
                "string.max": __("Maximum character length", { max: 50 }),
            }),

        email: Joi.string()
            .email({ tlds: { allow: false } })
            .lowercase()
            .trim()
            .min(5)
            .max(100)
            .required()
            .messages({
                "string.email": __("Must be a valid email"),
                "string.empty": __("Must be a valid email"),
                "string.min": __("Input email in between 5 to 50 characters"),
                "string.max": __("Input email in between 5 to 50 characters"),
                "any.required": __("Must be a valid email"),
            }),

        /** Role can be a single non-empty string or an array with at least one non-empty string */
        role: Joi.alternatives()
            .try(
                Joi.string().trim().min(1),
                Joi.array().items(Joi.string().trim().min(1)).min(1)
            )
            .required()
            .messages({
                "any.required": __("Please select a role"),
                "alternatives.match": __("Please select a role"),
                "string.empty": __("Please select a role"),
                "array.min": __("Please select a role"),
            }),
    };

    return Joi.object(baseSchema);
};

/**
 * Tenant User Email Verification Schema
 *
 * Validates the form data during the user email verification and password setup step.
 * Ensures:
 * - verifyToken is exactly 6 characters
 * - email is present (further email format validation can be added if needed)
 * - password is 8-20 characters and contains at least:
 *   • one uppercase letter
 *   • one lowercase letter
 *   • one digit
 *   • one special character
 * - confirmPassword matches password exactly
 *
 * @param {function} __ - Translation function for localized error messages
 * @returns {Joi.ObjectSchema} Joi validation schema
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export const TenantUserEmailVerifySchema = function (__) {
    return Joi.object({
        verifyToken: Joi.string()
            .trim()
            .required()
            .length(6)
            .messages({
                "string.empty": __("Enter verification code received by email"),
                "any.required": __("Enter verification code received by email"),
                "string.length": __("Must be exactly :size characters", {
                    size: 6,
                }),
            }),

        email: Joi.string()
            .email({ tlds: { allow: false } })
            .required()
            .messages({
                "string.empty": __("Email is required"),
                "any.required": __("Email is required"),
                "string.email": __("Please enter a valid email address"),
            }),

        password: Joi.string()
            .required()
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/) // remove {8,20} from regex
            .min(8)
            .max(20)
            .messages({
                "string.empty": __("Password can not be empty"),
                "any.required": __("Password can not be empty"),
                "string.min": __(
                    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
                ),
                "string.max": __(
                    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
                ),
                "string.pattern.base": __(
                    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
                ),
            }),

        confirmPassword: Joi.string()
            .required()
            .valid(Joi.ref("password"))
            .messages({
                "string.empty": __("Enter confirm password"),
                "any.required": __("Enter confirm password"),
                "any.only": __("Passwords do not match"),
            }),
    });
};

export const TenantEmailSchema = function (__) {
    return Joi.object({
        email: Joi.string()
            .email({ tlds: { allow: false } }) /* skip domain checking */
            .min(5)
            .max(100)
            .required()
            .messages({
                "string.email": __("Must be a valid email"),
                "string.empty": __("Must be a valid email"),
                "string.min": __("Minimum character length", { min: 5 }),
                "string.max": __("Maximum character length", { max: 100 }),
                "any.required": __("Must be a valid email"),
            }),
    });
};

export const TenantResetPasswordSchema = function (__) {
    return Joi.object({
        email: Joi.string()
            .email({ tlds: { allow: false } }) /* skip domain checking */
            .min(5)
            .max(100)
            .required()
            .messages({
                "string.email": __("Must be a valid email"),
                "string.empty": __("Must be a valid email"),
                "string.min": __("Minimum character length", { min: 5 }),
                "string.max": __("Maximum character length", { max: 100 }),
                "any.required": __("Must be a valid email"),
            }),

        password: Joi.string()
            .required()
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/) // remove {8,20} from regex
            .min(8)
            .max(20)
            .messages({
                "string.empty": __("Password can not be empty"),
                "any.required": __("Password can not be empty"),
                "string.min": __(
                    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
                ),
                "string.max": __(
                    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
                ),
                "string.pattern.base": __(
                    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
                ),
            }),
        confirmPassword: Joi.string()
            .required()
            .valid(Joi.ref("password"))
            .messages({
                "string.empty": __("Confirm password can not be empty"),
                "any.required": __("Confirm password can not be empty"),
                "any.only": __("Confirm password does not match with password"),
            }),
    });
};

export const TenantGlobalRegistrationFormStep1 = [
    {
        name: "company",
        type: "text",
        label: "Enter your company",
        required: true,
        autoCompleteAttr: "new-company",
        icon: "company",
        joinBtnText: "",
    },
    {
        name: "email",
        type: "email",
        label: "Enter your email",
        required: true,
        autoCompleteAttr: "email",
        icon: "email",
        joinBtnText: "",
    },
    {
        name: "password",
        type: "password",
        label: "Enter your password",
        required: true,
        autoCompleteAttr: "new-password",
        icon: "password",
        joinBtnText: "Show",
    },
];

export const TenantGlobalRegistrationFormStep2 = [
    {
        name: "name",
        type: "text",
        label: "Enter your name",
        required: false,
        autoCompleteAttr: "false",
    },
    {
        name: "company",
        type: "text",
        label: "Enter your company name",
        required: false,
        autoCompleteAttr: "false",
    },
];

export const TenantForgetPasswordForm = [
    {
        name: "email",
        type: "text",
        label: "Enter your email",
        required: false,
        autoCompleteAttr: "false",
        icon: "email",
    },
];

export const TenantUserResetPasswordForm = [
    {
        name: "password",
        type: "password",
        label: "Enter your password",
        required: false,
        autoCompleteAttr: "new-password",
        icon: "password",
        joinBtnText: "Show",
    },
    {
        name: "confirmPassword",
        type: "password",
        icon: "password",
        label: "Confirm password",
        placeholder: "Enter confirm password",
        autoCompleteAttr: "re-password",
        joinBtnText: "Show",
    },
];

export const TenantGlobalRegistrationVerify = [
    {
        name: "verifyToken",
        type: "number",
        label: "Enter your otp",
        required: false,
        autoCompleteAttr: "verifyToken",
        icon: "token",
    },
];

export const TenantUserRegistrationVerify = [
    {
        name: "verifyToken",
        type: "text",
        icon: "token",
        label: "Enter your verify token",
        required: false,
        autoCompleteAttr: "verifyToken",
        joinBtnText: "",
    },
    {
        name: "password",
        type: "password",
        icon: "password",
        label: "Enter your password",
        required: false,
        autoCompleteAttr: "new-password",
        joinBtnText: "Show",
    },
    {
        name: "confirmPassword",
        type: "password",
        icon: "password",
        label: "Enter confirm password",
        required: false,
        autoCompleteAttr: "re-password",
        joinBtnText: "Show",
    },
];

export const TenantGlobalLoginFormStep1 = [
    {
        name: "email",
        type: "email",
        label: "Enter your email",
        required: false,
        autoCompleteAttr: "email",
        icon: "email",
        joinBtnText: "",
    },
    {
        name: "password",
        type: "password",
        label: "Enter your password",
        required: false,
        autoCompleteAttr: "new-password",
        icon: "password",
        joinBtnText: "Show",
    },
];

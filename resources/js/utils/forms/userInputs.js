/**
 * @component TenantUserCreateInputs
 * @file TenantUserCreateInputs.js
 *
 * @description
 * - This module exports the configuration array for Tenant User creation form inputs.
 * - It defines the structure and properties of form fields including text inputs,
 * - Email inputs, select dropdowns, and checkbox groups.
 * - Each field configuration includes properties for rendering, validation, and layout.
 *
 * @property {string} name - Unique identifier for the form field (should match backend field name)
 * @property {string} type - Type of input field ('text', 'email', 'password', 'select', 'checkbox-group')
 * @property {string} icon - Icon identifier for the field (used for displaying icons in UI)
 * @property {string} label - Display label for the form field
 * @property {string} placeholder - Placeholder text shown in empty input fields
 * @property {string} note - Additional note or hint text for the field
 * @property {boolean} required - Whether the field is required for form submission
 * @property {boolean} inForm - Whether the field should be displayed in the form
 * @property {boolean} inPreview - Whether the field should be displayed in preview mode
 * @property {string} gridSize - CSS grid column class for responsive layout (e.g., 'col-span-full')
 * @property {string} autoCompleteAttr - HTML autocomplete attribute value for accessibility
 * @property {Array<Object>} [options] - Array of option objects for select/checkbox-group fields
 * @property {string} options.optValue - Value for the option
 * @property {string} options.optLabel - Display label for the option
 * @property {boolean} options.isSelected - Whether the option is selected by default
 * @property {boolean} options.isDisabled - Whether the option is disabled
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author Mamun <mamunhossen149191@gmail.com>
 */
export const TenantUserCreateInputs = [
    /**
     * Name field configuration
     * Text input for capturing the user's full name
     */
    {
        name: "name",
        type: "text",
        icon: "name",
        label: "Full name",
        placeholder: "Ex: sakil jomadder",
        note: "",
        required: true,
        inForm: true,
        inPreview: true,
        gridSize: "",
        autoCompleteAttr: "new-name",
    },

    /**
     * Email field configuration
     * Email input for capturing the user's email address
     */
    {
        name: "email",
        type: "email",
        icon: "email",
        label: "Email",
        placeholder: "Ex: your@email.com",
        note: "",
        required: true,
        inForm: true,
        inPreview: true,
        gridSize: "",
        autoCompleteAttr: "new-email",
    },

    /**
     * Department field configuration
     * Select dropdown for department selection with a default disabled option
     */
    {
        name: "department",
        type: "select",
        label: "Department",
        note: "",
        required: false,
        inForm: true,
        inPreview: true,
        gridSize: "col-span-full",
        options: [
            {
                optValue: "",
                optLabel: "Select department",
                isSelected: true,
                isDisabled: true,
            },
        ],
    },

    /**
     * Role checkbox group configuration
     * Allows selection of multiple roles, spans full column width
     */
    {
        name: "role",
        type: "checkbox-group",
        label: "Role",
        note: "",
        required: true,
        inForm: true,
        inPreview: true,
        gridSize: "col-span-full",
        options: [],
    },

    /**
     * Model active status switch configuration
     * Toggle switch to set the user's active status
     */
    {
        name: "is_active",
        type: "switch",
        label: "Status",
        note: "",
        required: true,
        inForm: true,
        inPreview: true,
        gridSize: "col-span-full",
        options: [],
    },
];

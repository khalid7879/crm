export const TenantPermissionCreateInputs =  [
    {
        name: "name",
        type: "text",
        icon: "name",
        label: "Name",
        placeholder: "Enter your name",
        note: "exampleName",
        required: false,
        inForm: true,
        inPreview: true,
        gridSize: "",
        autoCompleteAttr: "new-name",
    },
    {
        name: "module",
        type: "select",
        label: "Module",
        note: "exampleModule",
        required: false,
        inForm: true,
        inPreview: true,
        gridSize: "",
        options: [
            {
                optValue: "",
                optLabel: "select Module",
                isSelected: true,
                isDisabled: true,
            },
            {
                optValue: "OTHERS",
                optLabel: "Others",
                isSelected: false,
                isDisabled: false,
            },
            {
                optValue: "MALE",
                optLabel: "Male",
                isSelected: false,
                isDisabled: false,
            },
            {
                optValue: "FEMALE",
                optLabel: "Female",
                isSelected: false,
                isDisabled: false,
            },
        ],
    }
  
];
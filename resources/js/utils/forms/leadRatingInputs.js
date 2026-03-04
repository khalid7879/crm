export const TenantLeadRatingCreateInputs =  [
    {
        name: "name",
        type: "text",
        icon: "name",
        label: "Name",
        placeholder: "Enter lead rating name",
        note: "exampleName",
        required: false,
        inForm: true,
        inPreview: true,
        gridSize: "",
        autoCompleteAttr: "new-name",
    },
    {
        name: "rating",
        type: "select",
        label: "Rating",
        note: "exampleRole",
        required: false,
        inForm: true,
        inPreview: true,
        gridSize: "",
        options: [
            {
                optValue: "",
                optLabel: "Select Rating",
                isSelected: true,
                isDisabled: true,
            },
        ],
    },
  
];
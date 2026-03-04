export const TenantModuleCreateInputs =  [
    {
        name: "name",
        type: "text",
        icon: "name",
        label: "Name",
        placeholder: "Enter module name",
        note: "exampleName",
        required: false,
        inForm: true,
        inPreview: true,
        gridSize: "",
        autoCompleteAttr: "new-name",
    },
    {
        name: "note",
        type: "text",
        icon: "note",
        label: "Note",
        placeholder: "Write note",
        note: "exampleNote",
        required: true,
        inForm: true,
        inPreview: true,
        gridSize: "",
        autoCompleteAttr: "new-note",
    },
  
];
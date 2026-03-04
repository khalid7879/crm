export const sidebarNavItems = (keys = []) => {
    return [
        {
            key: "dashboard",
            icon: "dashboard",
            label: "Dashboard",
            routeName: "tenant.dashboard",
        },

        {
            key: "task",
            icon: "task",
            label: "Tasks",
            routeName: "tenant.tasks.index",
        },

        {
            key: "contact",
            icon: "contact2",
            label: "Contacts",
            routeName: "tenant.contacts.index",
        },
        {
            key: "lead",
            icon: "lead",
            label: "Leads",
            routeName: "tenant.leads.index",
        },
        {
            key: "opportunities",
            icon: "opportunity2",
            label: "Opportunities",
            routeName: "tenant.opportunity.index",
        },
        {
            key: "organizations",
            icon: "organization",
            label: "Organizations",
            routeName: "tenant.organization.index",
        },
        {
            key: "projects",
            icon: "projects",
            label: "Projects",
            routeName: "tenant.projects.index",
        },
        {
            key: "report",
            icon: "report2",
            label: "Reports",
            routeName: "tenant.report",
        },
    ];
};

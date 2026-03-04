/**
 * Generates the full navigation structure for the reporting section based on
 * the permissions of the logged-in user.
 *
 * Each navigation item contains metadata such as label, icon, route link,
 * and permission requirements.
 *
 * ### Parent vs Child Items
 * - **Parent Items (`isParent: true`)**
 *      - Use `permissions: []`
 *      - The `permissions` array contains *multiple* permissions that allow
 *        the user to view the parent section and all its child routes.
 *      - A parent item becomes visible if the user has **any one** of the
 *        listed permissions.
 *
 * - **Child Items (`isParent: false`)**
 *      - Use `permission: ""`
 *      - A child item is visible only if the user has **exactly the specific**
 *        permission defined in the `permission` property.
 *
 * ### Navigation Item Example
 * @example
 * {
 *   icon: "",
 *   label: "Lead reports",
 *   isParent: true,
 *   link: "",
 *   permission: "all-lead-report-group",
 *   permissions: [
 *       "all-lead-report-group",
 *       "all-lead-report",
 *       "lead-report-by-status",
 *   ],
 *   group: "leads",
 * }
 *
 * ### Function Parameters
 * @param {Array<string>} userPermissions
 *      The list of permissions assigned to the authenticated user.
 *      Example: ["all-lead-report", "lead-report-by-status"]
 *
 * @returns {Array<Object>}
 *      Returns an array of navigation item objects after evaluating permissions.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export function reportNavItems(userPermissions = []) {
    const allowedPermissions = userPermissions.map((singlePermission) =>
        singlePermission.toLowerCase()
    );

    return [
        {
            icon: "lead",
            label: "Lead reports",
            isParent: true,
            link: "",
            permission: "all-lead-report-group",
            permissions: ["all-lead-report", "lead-report-by-status"],
            group: "leads",
        },
        {
            icon: "lead",
            label: "Lead report",
            isParent: false,
            link: "tenant.leads-all.report",
            permission: "all-lead-report",
            permissions: ["all-lead-report"],
            group: "leads",
        },
        {
            icon: "lead",
            label: "Lead status report",
            isParent: false,
            link: "tenant.leads-by.status.report",
            permission: "lead-report-by-status",
            permissions: [],
            group: "leads",
        },
        {
            icon: "contact",
            label: "Contact report",
            isParent: true,
            link: "",
            permission: "all-contact-report-group",
            permissions: ["all-contact-report"],
        },
        {
            icon: "contact",
            label: "Contact report",
            isParent: false,
            link: "tenant.contacts-all.report",
            permission: "all-contact-report",
            permissions: [],
        },
        {
            icon: "task",
            label: "Task reports",
            isParent: true,
            link: "",
            permission: "all-task-report-group",
            permissions: ["all-task-report"],
        },
        {
            icon: "task",
            label: "Task report",
            isParent: false,
            link: "tenant.tasks-all.report",
            permission: "all-task-report",
            permissions: [],
        },
        {
            icon: "opportunity",
            label: "Opportunity report",
            isParent: true,
            link: "",
            permission: "all-opportunity-report-group",
            permissions: ["all-opportunity-report"],
        },
        {
            icon: "opportunity",
            label: "Opportunity report",
            isParent: false,
            link: "tenant.opportunities-all.report",
            permission: "all-opportunity-report",
            permissions: [],
        },
        {
            icon: "projects",
            label: "Project report",
            isParent: true,
            link: "",
            permission: "all-project-report-group",
            permissions: ["all-project-report"],
        },
        {
            icon: "projects",
            label: "Project report",
            isParent: false,
            link: "tenant.projects-all.report",
            permission: "all-project-report",
            permissions: [],
        },
        {
            icon: "organization",
            label: "Organization report",
            isParent: true,
            link: "",
            permission: "all-organizations-report-group",
            permissions: ["all-organization-report"],
        },
        {
            icon: "organization",
            label: "Organization report",
            isParent: false,
            link: "tenant.organizations-all.report",
            permission: "all-organization-report",
            permissions: [],
        },
        {
            icon: "users",
            label: "Users report",
            isParent: true,
            link: "",
            permission: "all-user-report-group",
            permissions: [
                "user-activity-report",
                "user-owner-associate-report",
                "user-activity-log-report",
            ],
        },
        {
            icon: "users",
            label: "User activity report",
            isParent: false,
            link: "tenant.users-activity.report",
            permission: "user-activity-report",
            permissions: [],
        },
        {
            icon: "users",
            label: "User owner associate report",
            isParent: false,
            link: "tenant.users-owner-associate.report",
            permission: "user-owner-associate-report",
            permissions: [],
        },
        {
            icon: "users",
            label: "User activity log report",
            isParent: false,
            link: "tenant.users-activity.log.report",
            permission: "user-activity-log-report",
            permissions: [],
        },
    ].filter((item) => {
        if (item.isParent) {
            return item.permissions.every((singlePermission) =>
                allowedPermissions.includes(singlePermission)
            );
        } else {
            return allowedPermissions.includes(item.permission);
        }
    });
}

/**
 * Generates the full navigation structure for the reporting section based on
 * the permissions of the logged-in user.
 *
 * Each navigation item contains metadata such as label, icon, route link,
 * and permission requirements.
 *
 * ### Parent vs Child Items
 * - **Parent Items (`isParent: true`)**
 *      - Use `permissions: []`
 *      - The `permissions` array contains *multiple* permissions that allow
 *        the user to view the parent section and all its child routes.
 *      - A parent item becomes visible if the user has **any one** of the
 *        listed permissions.
 *
 * - **Child Items (`isParent: false`)**
 *      - Use `permission: ""`
 *      - A child item is visible only if the user has **exactly the specific**
 *        permission defined in the `permission` property.
 *
 * ### Navigation Item Example
 * @example
 * {
 *   icon: "",
 *   label: "Lead reports",
 *   isParent: true,
 *   link: "",
 *   permission: "all-lead-report-group",
 *   permissions: [
 *       "all-lead-report-group",
 *       "all-lead-report",
 *       "lead-report-by-status",
 *   ],
 *   group: "leads",
 * }
 *
 * ### Function Parameters
 * @param {Array<string>} userPermissions
 *      The list of permissions assigned to the authenticated user.
 *      Example: ["all-lead-report", "lead-report-by-status"]
 *
 * @returns {Array<Object>}
 *      Returns an array of navigation item objects after evaluating permissions.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export function reportSidebarNavItems(userPermissions = []) {
    const allowedPermissions = userPermissions.map((singlePermission) =>
        singlePermission.toLowerCase()
    );

    return [
        {
            key: "standardReportGroup",
            icon: "leads",
            label: "Standard reports",
            link: "",
            permission: "",
            permissions: [
                "all-lead-report-group",
                "all-contact-report-group",
                "all-task-report-group",
                "all-opportunity-report-group",
                "all-project-report-group",
                "all-organizations-report-group",
                "all-user-report-group",
            ],
            isParent: true,
        },
        {
            key: "leads",
            icon: "lead",
            label: "Leads",
            link: "tenant.report",
            linkParams: { type: "leads" },
            permission: "all-lead-report-group",
            permissions: [""],
            isParent: false,
        },
        {
            key: "contacts",
            icon: "contact",
            label: "Contacts",
            link: "tenant.report",
            linkParams: { type: "contacts" },
            permission: "all-contact-report-group",
            permissions: [""],
            isParent: false,
        },
        {
            key: "tasks",
            icon: "task",
            label: "Tasks",
            link: "tenant.report",
            linkParams: { type: "tasks" },
            permission: "all-task-report-group",
            permissions: [],
            isParent: false,
        },
        {
            key: "opportunities",
            icon: "opportunity",
            label: "Opportunities",
            link: "tenant.report",
            linkParams: { type: "opportunities" },
            permission: "all-opportunity-report-group",
            permissions: [],
            isParent: false,
        },
        {
            key: "projects",
            icon: "projects",
            label: "Projects",
            link: "tenant.report",
            linkParams: { type: "projects" },
            permission: "all-project-report-group",
            permissions: [],
            isParent: false,
        },
        {
            key: "organizations",
            icon: "organizations",
            label: "Organizations",
            link: "tenant.report",
            linkParams: { type: "organizations" },
            permission: "all-organization-report-group",
            permissions: [],
            isParent: false,
        },
        {
            key: "users",
            icon: "users",
            label: "Users",
            link: "tenant.report",
            linkParams: { type: "users" },
            permission: "all-user-report-group",
            permissions: [],
            isParent: false,
        },
    ].filter((item) => {
        if (item.isParent) {
            return item.permissions.every((singlePermission) =>
                allowedPermissions.includes(singlePermission)
            );
        } else {
            return allowedPermissions.includes(item.permission);
        }
    });
}

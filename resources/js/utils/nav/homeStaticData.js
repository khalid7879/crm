/**
 * @constant pricingFeatureData
 *
 * @description
 * A data object containing the content and structure for a pricing feature comparison section.
 * It includes a section heading, informational text, and an array of pricing tiers (plans) with their respective names,
 * pricing details, highlight color class, and feature lists. The data is designed to be consumed by a pricing table component
 * to display tiered plans in a user-friendly, comparative layout.
 *
 * The "features" array in each plan supports progressive disclosure by including "Everything in [Previous Plan]"
 * as the first item where applicable, allowing components to render inherited features explicitly or handle them logically.
 *
 * @type {Object}
 * @property {string} key - Unique identifier for the data set (useful for translation or caching).
 * @property {string} sectionHeading - Main heading text for the pricing section.
 * @property {string} sectionInfo - Supporting descriptive paragraph below the heading.
 * @property {Array<Object>} items - Array of pricing plan objects.
 *
 * @property {Object} items[]
 * @property {string} items[].name - Name of the pricing tier (e.g., "Free", "Professional").
 * @property {string} items[].price - Pricing information or call-to-action text.
 * @property {string} items[].color - Tailwind CSS text color class for highlighting (e.g., "text-orange-500").
 * @property {Array<string>} items[].features - List of feature strings displayed for this plan.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export const pricingFeatureData = {
    key: "pricingFeatureData",
    sectionHeading: "Scale your business without starting from scratch",
    sectionInfo:
        "Free today and ready for tomorrow. You can upgrade your CRM at any time to access advanced capabilities without any disruption or need for data migration",
    items: [
        {
            key: "pricingFree",
            tip: "No credit card required",
            name: "Free",
            price: "$0/mo",
            color: "text-orange-500",
            features: [
                "No credit card required",
                "Contact management",
                "Deal pipelines",
                "CRM import",
                "Breeze Assistant (Beta)",
                "Reporting dashboard",
            ],
            isPopular: false,
        },
        {
            key: "pricingStarter",
            tip: "Most popular",
            name: "Starter",
            price: "$15/mo",
            color: "text-orange-500",
            features: [
                "Everything in Free",
                "Required fields",
                "Permission sets",
                "Multiple currencies",
                "No HubSpot branding",
            ],
            isPopular: true,
        },
        {
            key: "pricingProfessional",
            tip: "",
            name: "Professional",
            price: "$49/mo",
            color: "text-orange-500",
            features: [
                "Everything in Starter",
                "AI customer agent",
                "Duplicate management",
                "Standard contact scoring",
                "Calculated properties",
                "Custom reporting",
            ],
            isPopular: false,
        },
        {
            key: "pricingEnterprise",
            tip: "",
            name: "Enterprise",
            price: "$99/mo",
            color: "text-orange-500",
            features: [
                "Everything in Professional",
                "Custom objects",
                "Organize teams",
                "Single sign-on",
                "Field-level permissions",
            ],
            isPopular: false,
        },
    ],
};
/**
 * @property featuresSectionTopData
 * @description
 *
 *
 * @author MH Emon <mhemon833@gmail.com>
 */

export const featuresSectionTopData = {
    title: {
        text: "Explore our features",
        key: "featuresTitle",
        type: "text",
        icon: "",
        href: null,
    },
    description: {
        text: "Discover how each feature works and helps you get the most out of our platform. Click any section to learn more",
        key: "featuresDescription",
        type: "text",
        icon: null,
        href: null,
    },
};

/**
 * @const homeHeroSectionComponentData
 * Hero section data for the home page
 *
 * Contains the main headline and supporting description text
 * displayed in the primary hero/landing section of the website.
 *
 * This data is typically consumed by a Hero component to render
 * the main call-to-action area of the homepage.
 *
 * @author  Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author  MH Emon <mhemon833@gmail.com>
 *
 * @import { homeHeroSectionComponentData } from "@/utils/nav/homeStaticData";
 */
export const homeHeroSectionComponentData = {
    title: "AI-Driven CRM for Growing Teams Simple, Affordable, Powerful",
    description:
        "Track your entire sales pipeline in one centralized CRM. Automatically score leads, trigger follow-ups, run targeted marketing campaigns, and increase team productivity - so you can convert more leads into revenue",
};

/**
 * @const homeAiFeature
 * @description
 * This constant provides the structured data for the "AI Features" section displayed on the homepage or a dedicated features page.
 * It includes a section key, heading, info text (currently using placeholder values), and an array of individual AI-powered feature items.
 * Each item contains a unique ID, title, and description highlighting a specific AI functionality in the iHelp CRM platform.
 *
 * This data is typically consumed by a reusable section component to render a feature grid or card layout showcasing AI capabilities.
 * Note: Some fields (sectionHeading, sectionInfo) and one item description currently use placeholder text ("homeAiFeature", "Up COMING").
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export const homeAiFeature = {
    key: "homeAiFeature",
    sectionHeading: "Work Smarter, Get More Done with AI",
    sectionInfo:
        "Meet your digital teammate. With AI embedded across iHelp free CRM, you can automate routine work, unlock actionable customer insights, and accelerate business growth",
    items: [
        {
            id: "aiAssistant",
            title: "AI Assistant",
            description:
                "Use the iHelp AI-powered assistant to research companies, prepare for sales calls, summarize CRM records, and streamline your sales workflow",
        },
        {
            id: "aiContentWriter",
            title: "AI content writer",
            description:
                "Create engaging content and scale your content production effortlessly with AI—instantly, at the click of a button",
        },
        {
            id: "aiChatbotBuilder",
            title: "Chatbot builder",
            description:
                "Qualify leads, schedule meetings, deliver customer support, and scale personalized conversations effortlessly with AI-powered chatbot",
        },
        {
            id: "aiSharedInbox",
            title: "Shared inbox",
            description: "Upcoming",
        },
        {
            id: "aiEmailTracking",
            title: "Email tracking",
            description:
                "Receive instant notifications when prospects open your emails, enabling perfectly timed follow-ups to convert leads into deals faster",
        },
        {
            id: "aiEmailTemplates",
            title: "Email templates",
            description:
                "Convert high-performing emails into AI-powered templates your team can customize to close more deals faster",
        },
    ],
};

/**
 * @property MenuItemsConfig
 *
 * @description
 * This constant defines the primary navigation menu items for the application's sidebar or main navigation.
 * Each item represents a top-level section with a unique ID, display label, and associated icon name.
 * The icon names correspond to custom icon components or an icon library used in the project (e.g., "contact2", "lead", etc.).
 *
 * The array is exported and can be imported elsewhere to render dynamic navigation menus while maintaining a single source of truth.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export const menuItems = [
    { id: "contact", label: "Contacts", icon: "contact2" },
    { id: "leads", label: "Leads", icon: "lead" },
    { id: "calendars", label: "Calendars", icon: "date" },
    { id: "reporting", label: "Reporting", icon: "report2" },
    { id: "team", label: "Team Management", icon: "users" },
    { id: "integrations", label: "Integrations", icon: "code2" },
    { id: "security", label: "Security", icon: "lock" },
];

/**
 * @property FeatureSectionData
 *
 * @description
 * This constant holds the structured data for the application's feature showcase sections.
 * Currently contains detailed information for the "Contacts" module, including:
 * - A dynamic hero/testimonial section (title, content, author quote, and icon)
 * - An array of feature cards, each with a unique ID, title, description, and reference to an image asset.
 *
 * The data is designed to be consumed by a FeatureSection component to render hero content followed by a grid/layout of feature cards.
 * Additional sections (e.g., Leads, Calendars) can be added to the array in the future while maintaining the same structure.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */

export const featureSectionData = [
    {
        id: "contact",

        dynamicContent: {
            title: "Contacts",
            content:
                "We've been using iHelp CRM for over two years, and it has significantly improved our search accuracy and response times. The platform enabled us to build a highly reliable CRM database for the medical sector, while remaining intuitive and easy to use with minimal complexity",
            author: "Stan K.",
            icon: "contact",
        },
        cards: [
            {
                id: 1,
                title: "Contact profile",
                desc: "Centralize and manage all customer contact data in one CRM—names, addresses, phone numbers, emails, notes, files, tasks, and activity history—for complete visibility and control",
                image: "contact1",
            },
            {
                id: 2,
                title: "Contact syncing",
                desc: "Any updates made to your contacts in CRM automatically sync with Google—ensuring real-time, two-way data consistency across platforms",
                image: "contact2",
            },
            {
                id: 3,
                title: "Contact search",
                desc: "Quickly find specific contacts using keyword-based search across names, details, notes, and activity records",
                image: "contact3",
            },
            {
                id: 4,
                title: "Unlimited groups",
                desc: "Group, tag, and organize contacts into custom lists—CRM adapts to your preferred contact management structure",
                image: "contact4",
            },
            {
                id: 5,
                title: "Email logging",
                desc: "Automatically log all email communications in your CRM by securely connecting with Google, Microsoft, or IMAP—ensuring complete visibility across every customer interaction",
                image: "contact5",
            },
            {
                id: 6,
                title: "Contact activity logs",
                desc: "Automatically capture and timestamp every contact activity—including notes, completed tasks, meetings, and emails—within a complete, chronological CRM activity history",
                image: "contact6",
            },
        ],
    },
    {
        id: "leads",
        dynamicContent: {
            title: "Leads",
            content:
                "After implementing the Lead Management features in iHelp CRM, our lead conversion rate increased by 50 percent. The visual sales pipeline has proven to be a complete game changer for our team",
            author: "Faria S - Sales Manager",
            icon: "lead",
        },
        cards: [
            {
                id: 9,
                title: "Lead tracking",
                desc: "Track every lead from initial contact to final invoice managing the entire sales journey in one CRM",
                image: "lead1",
            },
            {
                id: 10,
                title: "Lead scoring",
                desc: "Effortlessly manage your sales pipeline—customizeEffortlessly manage your sales pipeline—customize stages for any process, track lead progress, and view the status of every deal at a glance. stages for any process, track lead progress, and view the status of every deal at a glance",
                image: "lead2",
            },
            {
                id: 11,
                title: "Unlimited custom pipeline fields",
                desc: "Customize pipeline fields to track every step of your process and capture all relevant information for each lead or deal",
                image: "lead3",
            },
        ],
    },
    {
        id: "calendars",
        desc: "Stay organized with integrated scheduling and reminders",
        dynamicContent: {
            title: "Calendars and scheduling",
            content: "Upcoming",
            author: "",
            icon: "date",
        },
        cards: [
            {
                id: 12,
                title: "Individual team member calendars",
                desc: "Each team member can manage their personal and work calendars separately within iHELP CRM for better organization and clearer work-life balance",
                image: "call1",
            },
            {
                id: 13,
                title: "Sub calendars (personal or private)",
                desc: "Create color-coded sub-calendars for projects, tasks, and personal to-dos to stay organized and keep your schedule clear and clutter-free",
                image: "call2",
            },
            {
                id: 14,
                title: "Event reminders",
                desc: "Receive email or text notifications before events begin (available in the US, Canada, and the UK), so you stay prepared without last-minute surprises",
                image: "call3",
            },
            {
                id: 15,
                title: "Shared team calendars",
                desc: "Easily schedule meetings with multiple team members to streamline coordination and improve team collaboration",
                image: "call4",
            },
            {
                id: 16,
                title: "Seamless Google and Outlook Calendar Sync for Unified Scheduling",
                desc: "Easily schedule meetings with multiple team members",
                image: "call5",
            },
        ],
    },
    {
        id: "reporting",

        dynamicContent: {
            title: "Reporting and insights",
            content:
                "Clear, detailed reports at a glance help me make fast, data-driven decisions with confidence",
            author: "Sakil Jo",
            icon: "report",
        },
        cards: [
            {
                id: 17,
                title: "Sales funnel report",
                desc: "Analyze performance at every stage of the sales funnel with clear, actionable CRM insights",
                image: "report2",
            },
            {
                id: 18,
                title: "Activity reports",
                desc: "Track team productivity and task completion rates in real time to improve accountability and operational efficiency",
                image: "report1",
            },
            {
                id: 19,
                title: "Task reports",
                desc: "View all follow-ups and to-dos in a single report to plan and prioritize your week or month more effectively",
                image: "report3",
            },
            {
                id: 20,
                title: "One click data exports",
                desc: "Export contacts, reports, and all CRM data into easy-to-read spreadsheets for analysis, sharing, and compliance",
                image: "report4",
            },
        ],
    },
    {
        id: "team",
        dynamicContent: {
            title: "Team collaboration",
            content:
                "The team management features keep everyone aligned and ensure tasks are delegated and executed efficiently across the organization",
            author: "Shuvro D.",
            icon: "users",
        },
        cards: [
            {
                id: 21,
                title: "Contact and lead assignment",
                desc: "Assign leads and contacts to team members in one click, ensuring clear ownership, focus, and faster follow-up",
                image: "team1",
            },
            {
                id: 22,
                title: "Company branding",
                desc: "Customize your CRM with your company logo and brand color theme to deliver a consistent, on-brand experience across your team.",
                image: "team2",
            },
            {
                id: 23,
                title: "Mobile access",
                desc: "iHelp is a web-based CRM that works seamlessly on mobile devices, providing your entire team with secure access anytime. No downloads or installations are required",
                image: "team3",
            },
            {
                id: 24,
                title: "Task and event assignments",
                desc: "Assign tasks, set deadlines, and schedule events directly in your CRM to streamline team workflow and boost productivity",
                image: "team4",
            },
            {
                id: 25,
                title: "Visibility and access permissions",
                desc: "Control team access in your CRM with precision—grant read-only, no access, or full edit permissions based on each user's role and needs",
                image: "team5",
            },
        ],
    },
    {
        id: "integrations",
        dynamicContent: {
            title: "Seamless integration",
            content:
                "Integrating our existing tools with iHelp CRM was seamless. The integrations are robust, reliable, and improve our workflow efficiency",
            author: "Nadia T.",
            icon: "code2",
        },
        cards: [
            {
                id: 26,
                title: "Calendars",
                desc: "Sync Help CRM with Google and Outlook calendars to manage all your events and meetings in one centralized place",
                image: "integration1",
            },
            {
                id: 27,
                title: "Marketing automation",
                desc: "Connect with popular marketing platforms",
                image: "integration2",
            },
            {
                id: 28,
                title: "Email marketing",
                desc: "Upcoming",
                image: "integration3",
            },
            {
                id: 29,
                title: "26 more plus api",
                desc: "Extend iHelp CRM capabilities with a wide range of tools tailored to your business or write your own with our API",
                image: "integration4",
            },
        ],
    },
    {
        id: "security",
        dynamicContent: {
            title: "Security and privacy",
            content:
                "I trust this platform with our data. The security protocols are top-notch and give me peace of mind",
            author: "Omar H., CTO",
            icon: "lock",
        },
        cards: [
            {
                id: 30,
                title: "Two-factor authentication",
                desc: "Enhance your account protection with an additional layer of security",
                image: "security1",
            },
            {
                id: 31,
                title: "Google login",
                desc: "Ensure data safety with automatic daily CRM backups and effortless restore options",
                image: "security2",
            },
            {
                id: 32,
                title: "Temporarily lock out users",
                desc: "Administrators can immediately block access if a teammate's account is compromised or misused, ensuring your CRM remains secure",
                image: "security3",
            },
            {
                id: 33,
                title: "256-bit encryption everywhere",
                desc: "All data transfers in iHelp CRM are protected with modern encryption to ensure security and privacy",
                image: "security4",
            },
        ],
    },
];

/**
 * @constant socialNavItems
 *
 * @description
 * This constant exports an array of social navigation items used for displaying social media follow/like links,
 * typically in the footer, header, or a dedicated social section of the website.
 *
 * Each item defines a social platform with its destination href, translation key for the label,
 * button style type (text, outline, primary), and the corresponding icon name.
 *
 * The data is imported and used in components that render social media buttons or links.
 *
 * @import { socialNavItems } from "@/utils/nav/homeStaticData";
 *
 * @example
 * const SocialLinks = () => {
 *   return (
 *     <div className="flex gap-4">
 *       {socialNavItems.map((item) => (
 *         <a
 *           key={item.key}
 *           href={item.href}
 *           className={`btn btn-${item.type}`}
 *           target="_blank"
 *           rel="noopener noreferrer"
 *         >
 *           <IconComponent icon={item.icon} />
 *           {__(item.label)}
 *         </a>
 *       ))}
 *     </div>
 *   );
 * };
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export const socialNavItems = [
    {
        href: "/",
        key: "pageFacebook",
        label: "Like us on facebook",
        type: "text",
        icon: "facebook",
    },
    {
        href: "/",
        key: "pageLinkedin",
        label: "Follow us on linkedin",
        type: "text",
        icon: "linkedIn",
    },
    {
        href: "/login",
        key: "pagTwitter",
        label: "Follow us on twitter",
        type: "outline",
        icon: "twitter",
    },
    {
        href: "/register",
        key: "channelYoutube",
        label: "Subscribe us on youtube",
        type: "primary",
        icon: "youtube",
    },
];

/**
 * @constant legalLinks
 *
 * Legal navigation links for footer
 * @type {Array<{ href: string, key: string, label: string, type: "text", icon: string }>}
 *
 * @import { legalLinks } from "@/utils/nav/homeStaticData";
 *
 * @example
 * legalLinks.map(link => <NavLink key={link.key} href={link.href} icon={link.icon}>{link.label}</NavLink>)
 *
 * @author MH Emon <mhemon833@gmail.com>
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export const legalLinks = [
    {
        href: "/security",
        key: "legalSecurity",
        label: "Security",
        type: "text",
        icon: "shield",
    },
    {
        href: "/privacy",
        key: "legalPrivacy",
        label: "Privacy",
        type: "text",
        icon: "lock",
    },
    {
        href: "/terms",
        key: "legalTerms",
        label: "Terms",
        type: "text",
        icon: "fileText",
    },
    {
        href: "/compliance",
        key: "legalCompliance",
        label: "Compliance",
        type: "text",
        icon: "checkCircle",
    },
];

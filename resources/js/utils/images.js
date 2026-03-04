import logo from "@images/common/logo.png";
import hero from "@images/home/dashboard.png";
import contact1 from "@images/home/contact-1.svg";
import contact2 from "@images/home/contact-2.svg";
import contact3 from "@images/home/contact-3.svg";
import contact4 from "@images/home/contact-4.svg";
import contact5 from "@images/home/contact-5.png";
import contact6 from "@images/home/contact-6.svg";
import contact7 from "@images/home/contact-7.png";
import contact8 from "@images/home/contact-8.svg";
import contact9 from "@images/home/contact-9.svg";
import contentBg from "@images/home/content-bg.png";
import lead1 from "@images/home/lead-1.svg";
import lead2 from "@images/home/lead-2.svg";
import lead3 from "@images/home/lead-3.svg";
import call1 from "@images/home/call-1.svg";
import call2 from "@images/home/call-2.svg";
import call3 from "@images/home/call-3.svg";
import call4 from "@images/home/call-4.svg";
import call5 from "@images/home/call-5.svg";
import report1 from "@images/home/report-1.svg";
import report2 from "@images/home/report-2.svg";
import report3 from "@images/home/report-3.svg";
import report4 from "@images/home/report-4.svg";
import team1 from "@images/home/team-1.svg";
import team2 from "@images/home/team-2.svg";
import team3 from "@images/home/team-3.png";
import team4 from "@images/home/team-4.svg";
import team5 from "@images/home/team-5.svg";
import integration1 from "@images/home/integration-1.svg";
import integration2 from "@images/home/integration-2.svg";
import integration3 from "@images/home/integration-3.svg";
import integration4 from "@images/home/integration-4.svg";
import security1 from "@images/home/security-1.svg";
import security2 from "@images/home/security-2.svg";
import security3 from "@images/home/security-3.png";
import security4 from "@images/home/security-4.svg";
import aiCrm from "@images/home/ai-crm.webp";
import ofcTeam1 from "@images/office/team-1.png";
import ofcTeam2 from "@images/office/team-2.png";
import ofcTeam3 from "@images/office/team-3.png";
import ofcTeam4 from "@images/office/team-4.png";
import ofcTeam5 from "@images/office/team-5.png";
import ofcTeam6 from "@images/office/team-6.png";
import ofcTeam7 from "@images/office/team-2.png";
import ofcTeam8 from "@images/office/team-4.png";
import ofcTeam9 from "@images/office/team-6.png";

/**
 * @var imageRegistry
 *
 * @description
 * A centralized registry object that stores metadata for images used throughout the application.
 * This registry is consumed by the `useLazyImages` hook and `LazyImageSection` component to enable
 * efficient lazy loading, LCP (Largest Contentful Paint) prioritization, and consistent alt text management.
 *
 * Each key in the object represents a unique image identifier (e.g., 'hero'), and its value is an object
 * containing:
 * - `src`: The imported image module (Webpack/Vite asset).
 * - `alt`: Accessible alternative text for screen readers and SEO.
 * - `lcp`: Boolean flag indicating if this image should be prioritized for LCP optimization
 *   (e.g., preload with <link rel="preload"> in layout/head).
 *
 * Centralizing image metadata here ensures:
 * - Consistent usage across components.
 * - Easy updates (e.g., changing alt text or toggling LCP).
 * - Compatibility with lazy-loading logic without scattering imports.
 *
 * @type {Object<string, {src: string, alt: string, lcp?: boolean}>}
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export const imageRegistry = {
    ofcTeam1: {
        src: ofcTeam1,
        alt: "ofcTeam1",
        lcp: true,
    },
    ofcTeam2: {
        src: ofcTeam2,
        alt: "ofcTeam2",
        lcp: true,
    },
    ofcTeam3: {
        src: ofcTeam3,
        alt: "ofcTeam3",
        lcp: true,
    },
    ofcTeam4: {
        src: ofcTeam4,
        alt: "ofcTeam4",
        lcp: true,
    },
    ofcTeam5: {
        src: ofcTeam5,
        alt: "ofcTeam5",
        lcp: true,
    },
    ofcTeam6: {
        src: ofcTeam6,
        alt: "ofcTeam6",
        lcp: true,
    },
    ofcTeam7: {
        src: ofcTeam7,
        alt: "ofcTeam7",
        lcp: true,
    },
    ofcTeam8: {
        src: ofcTeam8,
        alt: "ofcTeam8",
        lcp: true,
    },
    ofcTeam9: {
        src: ofcTeam9,
        alt: "ofcTeam9",
        lcp: true,
    },
    aiCrm: {
        src: aiCrm,
        alt: "aiCrm",
        lcp: true,
    },
    security4: {
        src: security4,
        alt: "security4",
        lcp: true,
    },
    security3: {
        src: security3,
        alt: "security3",
        lcp: true,
    },
    security2: {
        src: security2,
        alt: "security2",
        lcp: true,
    },
    security1: {
        src: security1,
        alt: "security1",
        lcp: true,
    },
    integration4: {
        src: integration4,
        alt: "integration4",
        lcp: true,
    },
    integration3: {
        src: integration3,
        alt: "integration3",
        lcp: true,
    },
    integration2: {
        src: integration2,
        alt: "integration2",
        lcp: true,
    },
    integration1: {
        src: integration1,
        alt: "integration1",
        lcp: true,
    },
    team5: {
        src: team5,
        alt: "team5",
        lcp: true,
    },
    team4: {
        src: team4,
        alt: "team4",
        lcp: true,
    },
    team3: {
        src: team3,
        alt: "team3",
        lcp: true,
    },
    team2: {
        src: team2,
        alt: "team2",
        lcp: true,
    },
    team1: {
        src: team1,
        alt: "team1",
        lcp: true,
    },
    report4: {
        src: report4,
        alt: "report4",
        lcp: true,
    },
    report3: {
        src: report3,
        alt: "report3",
        lcp: true,
    },
    report2: {
        src: report2,
        alt: "report2",
        lcp: true,
    },
    report1: {
        src: report1,
        alt: "report1",
        lcp: true,
    },
    call5: {
        src: call5,
        alt: "call5",
        lcp: true,
    },
    call4: {
        src: call4,
        alt: "call4",
        lcp: true,
    },
    call3: {
        src: call3,
        alt: "call3",
        lcp: true,
    },
    call2: {
        src: call2,
        alt: "call2",
        lcp: true,
    },
    call1: {
        src: call1,
        alt: "call1",
        lcp: true,
    },
    lead3: {
        src: lead3,
        alt: "lead3",
        lcp: true,
    },
    lead2: {
        src: lead2,
        alt: "lead2",
        lcp: true,
    },
    lead1: {
        src: lead1,
        alt: "lead1",
        lcp: true,
    },
    contentBg: {
        src: contentBg,
        alt: "contentBg",
        lcp: true,
    },
    contact9: {
        src: contact9,
        alt: "contact9",
        lcp: true,
    },
    contact8: {
        src: contact8,
        alt: "contact8",
        lcp: true,
    },
    contact7: {
        src: contact7,
        alt: "contact7",
        lcp: true,
    },
    contact6: {
        src: contact6,
        alt: "contact6",
        lcp: true,
    },
    contact5: {
        src: contact5,
        alt: "contact5",
        lcp: true,
    },
    contact4: {
        src: contact4,
        alt: "contact4",
        lcp: true,
    },
    contact3: {
        src: contact3,
        alt: "contact3",
        lcp: true,
    },
    contact2: {
        src: contact2,
        alt: "contact2",
        lcp: true,
    },
    contact1: {
        src: contact1,
        alt: "contact1",
        lcp: true,
    },
    hero: {
        src: hero,
        alt: "AI-powered CRM dashboard",
        lcp: true,
    },
    logo: {
        src: logo,
        alt: "Logo",
        lcp: true,
    },
};

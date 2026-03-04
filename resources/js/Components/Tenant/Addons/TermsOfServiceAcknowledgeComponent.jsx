import React from "react";

/**
 * TermsOfServiceAcknowledgeComponent
 *
 * Displays a small acknowledgment text with clickable
 * Terms of Service and Privacy Policy links.
 * Commonly used below authentication/signup forms.
 *
 * @returns {JSX.Element}
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function TermsOfServiceAcknowledgeComponent() {
    return (
        <p className="text-[10px] text-center text-gray-500 mt-3 leading-relaxed">
            By signing up, you agree to the &nbsp;
            <a
                href="#"
                className="text-gray-700 font-semibold hover:underline "
            >
                Terms of Service
            </a>
            &nbsp; and acknowledge our &nbsp;
            <a
                href="#"
                className="text-gray-700 font-semibold hover:underline "
            >
                Privacy Policy
            </a>
        </p>
    );
}

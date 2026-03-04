import React from "react";

/**
 * AuthHeaderComponent
 *
 * A reusable header component designed for authentication pages (login, register, reset password, etc.).
 * It displays a centered title and allows additional content (e.g., subtitles, descriptions, or icons)
 * to be rendered below the title via the `children` prop.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Optional content to render below the main title.
 *   Commonly used for subtitles, instructional text, or decorative elements.
 * @param {string} [props.title="Register yourself"] - The main heading text displayed in the header.
 *   Defaults to "Register yourself" if not provided.
 *
 * @returns {JSX.Element} A centered header element with a bold title and optional children content.
 *
 * @example
 * - Basic usage with default title
 * <AuthHeaderComponent />
 *
 * @example
 * - Custom title and subtitle
 * <AuthHeaderComponent title="Welcome Back">
 *   <p className="text-gray-600">Please sign in to continue</p>
 * </AuthHeaderComponent>
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function AuthHeaderComponent({
    children,
    title = "Register yourself",
}) {
    return (
        <header className="text-center">
            <h1 className="text-2xl font-bold text-gray-500 mb-2">{title}</h1>
            {children}
        </header>
    );
}

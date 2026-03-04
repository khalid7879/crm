import React, { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";

export default function NotificationListener() {
    const { auth } = usePage().props;
    const [notifications, setNotifications] = useState([]); // Add this line

    console.log("notification listener");

    useEffect(() => {
        // Listen to public notifications
        window.Echo.channel("notifications").listen(
            "NotificationDataEvent",
            (e) => {
                setNotifications((prev) => [...prev, e]);
                // You can also show a toast notification here
                console.log("New notification:", e);
            }
        );

        // Listen to private user notifications (if user is authenticated)
        if (auth.id) {
            console.log("New notification: 02");
            console.log(`${auth.id}`);
           window.Echo.private(`user.${auth.id}`).listen(
               "NotificationDataEvent",
               (e) => {
                   setNotifications((prev) => [...prev, e]);
                   console.log("Private notification:", e);
               }
           );
        }

        // Cleanup
        return () => {
            window.Echo.leaveChannel("notifications");
            if (auth.id) {
                window.Echo.leaveChannel(`user.${auth.id}`);
            }
        };
    }, [auth.id]);

    return (
        <div>
            {/* Display notifications */}
            <div className="notification-container">
                {notifications.map((notification, index) => (
                    <div key={index} className="notification">
                        {notification.message}
                    </div>
                ))}
            </div>
        </div>
    );
}

"use client";

import React from "react";
import { useNotification } from "@/app/contexts/ToastNotificationContext";

// container that renders the list of notification this needs to be included at the top of the application
// inside notification provider along side the app component
export const ToastContainer = () => {
  const { notificationsList, removeNotification, CustomComponent } =
    useNotification();

  return (
    <div className="toast-container">
      {notificationsList.map((notification) => {
        if (CustomComponent) {
          return <CustomComponent key={notification.id} {...notification} />;
        }

        return (
          <div
            key={notification.id}
            className={`toast-container ${notification.type}`}
            style={{ marginTop: "10px" }}
          >
            <p>{notification.message}</p>
            <button onClick={() => removeNotification(notification.id)}>
              Close
            </button>
          </div>
        );
      })}
    </div>
  );
};

"use client";

import React, {
  createContext,
  useState,
  ReactNode,
  useContext,
  useEffect,
} from "react";
import { ToastContainer } from "../components/ToastContainer";

export enum NotificationTypes {
  success = "success",
  error = "error",
  info = "info",
}

// notification object
export interface Notification {
  id: string;
  message: string;
  type: NotificationTypes;
  duration?: number; // milliseconds to show
}

interface NotificationContextProps {
  notificationsList: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
  CustomComponent?: React.ElementType;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(
  undefined
);

export const useNotification = (): NotificationContextProps => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

interface ToastNotificationProviderProps {
  children: ReactNode;
  customComponent?: React.ElementType;
}

export const ToastNotificationProvider = ({
  children,
  customComponent: CustomComponent,
}: ToastNotificationProviderProps) => {
  const [notificationsList, setNotificationsList] = useState<Notification[]>(
    []
  );

  const addNotification = (notification: Omit<Notification, "id">) => {
    const id = crypto.randomUUID();

    const newNotification = { ...notification, id };

    setNotificationsList((prev) => [...prev, newNotification]);

    if (notification.duration) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotificationsList((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  };

  return (
    <NotificationContext.Provider
      value={{
        notificationsList,
        addNotification,
        removeNotification,
        CustomComponent,
      }}
    >
      {children}
      <ToastContainer />
    </NotificationContext.Provider>
  );
};

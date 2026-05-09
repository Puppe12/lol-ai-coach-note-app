"use client";

import {
  MantineProvider,
  createTheme,
  MantineColorsTuple,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { useTheme } from "@/app/contexts/ThemeContext";
import { ReactNode } from "react";

const sageGreen: MantineColorsTuple = [
  "#f6f7f4",
  "#e8ece4",
  "#d2dacb",
  "#b8c4b0",
  "#9fb199",
  "#869f83",
  "#6e8a6d",
  "#5a735a",
  "#485c48",
  "#374737",
];

const theme = createTheme({
  primaryColor: "sageGreen",
  colors: {
    sageGreen,
  },
  fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif",
  headings: {
    fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif",
  },
  white: "#FFFFFF",
  black: "var(--foreground)",
});

export function MantineThemeProvider({ children }: { children: ReactNode }) {
  const { theme: appTheme } = useTheme();

  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme="auto"
      forceColorScheme={appTheme === "dark" ? "dark" : "light"}
      cssVariablesResolver={() => ({
        variables: {
          "--mantine-color-body": "var(--background)",
          "--mantine-color-text": "var(--foreground)",
        },
        light: {},
        dark: {},
      })}
    >
      <Notifications position="top-right" />
      {children}
    </MantineProvider>
  );
}

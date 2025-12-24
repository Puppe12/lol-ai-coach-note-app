"use client";

import { MantineProvider, createTheme, MantineColorsTuple } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { useTheme } from "@/app/contexts/ThemeContext";
import { ReactNode } from "react";

// Sage green palette - muted, natural tones
const sageGreen: MantineColorsTuple = [
  "#f1f3e0", // sage-cream
  "#e8eed9",
  "#d2dcb6", // sage-light
  "#c5d3a8",
  "#b3c89f",
  "#a1bc98", // sage-medium
  "#8fa986",
  "#778873", // sage-dark
  "#606e5f",
  "#4a544a",
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
});

export function MantineThemeProvider({ children }: { children: ReactNode }) {
  const { theme: appTheme } = useTheme();

  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme="auto"
      forceColorScheme={appTheme === "dark" ? "dark" : "light"}
    >
      <Notifications position="top-right" />
      {children}
    </MantineProvider>
  );
}


import { ThemeVars } from "@mysten/dapp-kit";

export const customTheme: ThemeVars = {
  blurs: {
    modalOverlay: "blur(0)",
  },
  backgroundColors: {
    primaryButton: "#132d5b",            // Dark base color
    primaryButtonHover: "#1a3c73",       // Slightly lighter on hover
    outlineButtonHover: "#1a3c73",
    modalOverlay: "rgba(24 36 53 / 20%)",
    modalPrimary: "#0e203f",             // Dark modal background
    modalSecondary: "#132d5b",           // Consistent dark section
    iconButton: "transparent",
    iconButtonHover: "#1a3c73",
    dropdownMenu: "#1a1e2e",             // Dark dropdown background
    dropdownMenuSeparator: "#2c3545",
    walletItemSelected: "#1a3c73",
    walletItemHover: "#264570",
  },
  borderColors: {
    outlineButton: "#3b4a60",            // Match darker borders
  },
  colors: {
    primaryButton: "#ffffff",            // White text on dark button
    outlineButton: "#ffffff",            // Outline text color
    iconButton: "#ffffff",               // Icon color
    body: "#d1d5db",                     // Light gray for body text
    bodyMuted: "#9ca3af",                // Muted text
    bodyDanger: "#FF794B",
  },
  radii: {
    small: "6px",
    medium: "8px",
    large: "12px",
    xlarge: "16px",
  },
  shadows: {
    primaryButton: "0px 4px 12px rgba(0, 0, 0, 0.3)",
    walletItemSelected: "0px 2px 6px rgba(0, 0, 0, 0.2)",
  },
  fontWeights: {
    normal: "400",
    medium: "500",
    bold: "600",
  },
  fontSizes: {
    small: "14px",
    medium: "16px",
    large: "18px",
    xlarge: "20px",
  },
  typography: {
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    fontStyle: "normal",
    lineHeight: "1.3",
    letterSpacing: "1",
  },
};

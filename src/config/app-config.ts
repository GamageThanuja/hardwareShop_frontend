import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "BoltForge Hardware",
  version: packageJson.version,
  copyright: `© ${currentYear}, BoltForge Hardware.`,
  meta: {
    title: "BoltForge Hardware - Inventory Management Dashboard",
    description:
      "BoltForge Hardware is an inventory management dashboard for hardware products, suppliers, sales orders, purchase orders, stock, and reporting.",
  },
};

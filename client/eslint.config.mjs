import next from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...next,
  ...typescript,
  {
    rules: {
      // This codebase isn't adopting React Compiler lint rules yet.
      "react-hooks/error-boundaries": "off",
      "react-hooks/incompatible-library": "off",
      "react-hooks/immutability": "off",
      "react-hooks/set-state-in-effect": "off",

      // Allow CommonJS-style imports in config files (e.g. tailwind config).
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

export default eslintConfig;

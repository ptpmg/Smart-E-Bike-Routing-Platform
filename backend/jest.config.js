export default {
  testEnvironment: "node",
  // Necessário para ESM
  transform: {},
  // Corre setup antes dos testes
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testMatch: ["**/tests/**/*.test.js"]
};

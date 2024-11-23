export default {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.js"],
  moduleDirectories: ["node_modules", "."],
  transform: {
    "^.+\\.js$": "babel-jest",
  },
};

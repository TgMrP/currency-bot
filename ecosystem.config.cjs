const name = "Currency-Bot";

const dotenv = require("dotenv");
const path = require("path");

const env = dotenv.config({ path: "./.env" }).parsed;

module.exports = {
  apps: [
    // server
    {
      name: `${name}-bot`,
      cwd: path.resolve(__dirname),
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        ...env,
      },
    },
  ],
};

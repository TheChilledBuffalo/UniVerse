const { spawnSync } = require("node:child_process");

const gradleExecutable = process.platform === "win32" ? "gradlew.bat" : "./gradlew";
const gradleArgs = process.argv.slice(2);

const result = spawnSync(gradleExecutable, gradleArgs, {
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);

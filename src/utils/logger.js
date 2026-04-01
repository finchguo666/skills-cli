const chalk = require('chalk');

const logger = {
  info: (msg) => console.log(msg),
  success: (msg) => console.log(chalk.green(msg)),
  warn: (msg) => console.log(chalk.yellow(msg)),
  error: (msg) => console.log(chalk.red(msg)),
  dim: (msg) => console.log(chalk.dim(msg)),
  cyan: (msg) => console.log(chalk.cyan(msg))
};

module.exports = logger;

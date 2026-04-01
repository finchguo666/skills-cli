const ora = require('ora');

module.exports = function(text) {
  const spinner = ora(text);
  spinner.start();

  return {
    succeed: (msg) => spinner.succeed(msg),
    fail: (msg) => spinner.fail(msg),
    stop: () => spinner.stop(),
    set text(msg) {
      spinner.text = msg;
    }
  };
};

const ora = require('ora');

// handle both commonjs and ESM default exports
const spinnerFactory = typeof ora === 'function' ? ora : ora.default;

module.exports = function(text) {
  const spinner = spinnerFactory(text);
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

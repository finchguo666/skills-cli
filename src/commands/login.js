const NpmRunner = require('../core/npm-runner');
const spinner = require('../utils/spinner');

module.exports = async function login() {
  const spin = spinner('正在启动 npm 登录...');

  try {
    const npm = new NpmRunner();
    spin.stop();
    await npm.login();
  } catch (error) {
    spin.fail(`登录失败: ${error.message}`);
    throw error;
  }
};

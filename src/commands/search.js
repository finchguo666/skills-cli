const NpmRunner = require('../core/npm-runner');
const chalk = require('chalk');
const spinner = require('../utils/spinner');

module.exports = async function search(keyword) {
  const spin = spinner(`搜索 "${keyword}"...`);

  try {
    const npm = new NpmRunner();
    const results = await npm.search(keyword);

    spin.stop();

    if (!results || results.length === 0) {
      console.log(chalk.yellow(`未找到与 "${keyword}" 相关的 Skills`));
      return;
    }

    console.log(chalk.green(`\n找到 ${results.length} 个结果:\n`));

    results.slice(0, 20).forEach((item, index) => {
      const name = item.name;
      const description = item.description || '无描述';
      const version = item.version;
      const author = item.author?.name || 'unknown';

      console.log(chalk.cyan(`${index + 1}. ${name}@${version}`));
      console.log(chalk.dim(`   描述: ${description.substring(0, 80)}`));
      console.log(chalk.dim(`   作者: ${author}`));
      console.log();
    });

    if (results.length > 20) {
      console.log(chalk.dim(`显示前 20 条，共 ${results.length} 条结果`));
    }

  } catch (error) {
    spin.fail(`搜索失败: ${error.message}`);
    throw error;
  }
};

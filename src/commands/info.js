const NpmRunner = require('../core/npm-runner');
const ConfigManager = require('../core/config');
const chalk = require('chalk');
const spinner = require('../utils/spinner');

module.exports = async function info(packageName) {
  const spin = spinner(`获取 ${packageName} 信息...`);

  try {
    const npm = new NpmRunner();
    const config = new ConfigManager();

    // 获取包信息
    const pkgInfo = await npm.view(packageName);

    spin.stop();

    console.log(chalk.cyan(`\n📦 ${packageName}@${pkgInfo.version}\n`));
    console.log(chalk.white(pkgInfo.description || '无描述'));
    console.log();

    console.log(chalk.yellow('作者:'), pkgInfo.author?.name || 'unknown');
    console.log(chalk.yellow('许可证:'), pkgInfo.license || '未指定');
    console.log(chalk.yellow('发布时间:'), pkgInfo.time?.modified || '未知');
    console.log(chalk.yellow('下载量:'), pkgInfo.downloads?.toLocaleString() || '未知');

    // 获取 Skills 扩展信息
    const priority = await config.getPriority(packageName);
    console.log(chalk.yellow('优先级:'), priority);

    if (pkgInfo.dependencies && Object.keys(pkgInfo.dependencies).length > 0) {
      console.log(chalk.yellow('\n依赖:'));
      Object.entries(pkgInfo.dependencies).forEach(([name, version]) => {
        console.log(chalk.dim(`  ├─ ${name}@${version}`));
      });
    }

    console.log();
    console.log(chalk.dim(`安装: skills add ${packageName}`));

  } catch (error) {
    spin.fail(`获取失败: ${error.message}`);
    throw error;
  }
};

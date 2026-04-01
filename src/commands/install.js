const NpmRunner = require('../core/npm-runner');
const SkillsJson = require('../core/skills-json');
const ConfigManager = require('../core/config');
const spinner = require('../utils/spinner');
const chalk = require('chalk');

module.exports = async function install() {
  const spin = spinner('正在安装 Skills 依赖...');

  try {
    // 1. 检查 skills.json 是否存在
    const skillsJson = new SkillsJson();
    if (!await skillsJson.exists()) {
      spin.fail('skills.json 不存在，请先运行 skills init');
      return;
    }

    // 2. 调用 npm install
    const npm = new NpmRunner();
    await npm.install();

    // 3. 注册优先级
    spin.text = '正在注册 Skills 优先级...';
    const config = new ConfigManager();
    await config.registerInstalledSkills('./node_modules');

    spin.succeed('Skills 安装完成');

    // 4. 输出已安装的 Skills
    const deps = await skillsJson.getDependencies();
    const devDeps = await skillsJson.getDevDependencies();
    const allDeps = { ...deps, ...devDeps };
    const skillNames = Object.keys(allDeps);

    if (skillNames.length > 0) {
      console.log(chalk.cyan('\n已安装的 Skills:'));
      for (const name of skillNames) {
        const priority = await config.getPriority(name);
        console.log(chalk.dim(`  ${name} (优先级: ${priority})`));
      }
    }

  } catch (error) {
    spin.fail(`安装失败: ${error.message}`);
    throw error;
  }
};

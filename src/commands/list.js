const SkillsJson = require('../core/skills-json');
const ConfigManager = require('../core/config');
const chalk = require('chalk');

module.exports = async function list() {
  try {
    const skillsJson = new SkillsJson();
    const config = new ConfigManager();

    if (!await skillsJson.exists()) {
      console.log(chalk.yellow('skills.json 不存在，请先运行 skills init'));
      return;
    }

    const deps = await skillsJson.getDependencies();
    const devDeps = await skillsJson.getDevDependencies();
    const allDeps = { ...deps, ...devDeps };
    const skillNames = Object.keys(allDeps);

    if (skillNames.length === 0) {
      console.log(chalk.yellow('当前项目没有安装任何 Skills'));
      console.log(chalk.dim(`\n使用: skills add <package> 来添加 Skill`));
      return;
    }

    console.log(chalk.cyan(`\n已安装的 Skills (共 ${skillNames.length} 个):\n`));

    // 一次性读取所有优先级，减少 IO 操作
    const allPriorities = await config.getPriorities();
    for (const name of skillNames) {
      const version = allDeps[name];
      const priority = allPriorities[name] || 50;
      const isDev = devDeps[name] ? ' (dev)' : '';
      console.log(chalk.dim(`  ${name}@${version} — 优先级: ${priority}${isDev}`));
    }

    console.log();

  } catch (error) {
    console.log(chalk.red(`列出失败: ${error.message}`));
    throw error;
  }
};

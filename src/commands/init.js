const SkillsJson = require('../core/skills-json');
const chalk = require('chalk');

module.exports = async function init() {
  const skillsJson = new SkillsJson();

  if (await skillsJson.exists()) {
    console.log(chalk.yellow('skills.json 已存在'));
    return;
  }

  const name = process.cwd().split('/').pop();
  await skillsJson.generateTemplate(name);

  console.log(chalk.green('✓ 已创建 skills.json'));
  console.log(chalk.dim(`\n下一步：`));
  console.log(chalk.dim(`  skills add <package>   添加依赖`));
  console.log(chalk.dim(`  skills install         安装所有依赖`));
};

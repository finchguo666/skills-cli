const SkillsJson = require('../core/skills-json');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

module.exports = async function init() {
  const skillsJson = new SkillsJson();

  if (await skillsJson.exists()) {
    console.log(chalk.yellow('skills.json 已存在'));
    return;
  }

  const cwd = process.cwd();
  const name = cwd.split('/').pop();
  await skillsJson.generateTemplate(name);

  // 自动创建 .gitignore，添加 skills_modules 使其被 git 和 IDE 忽略
  const gitignorePath = path.join(cwd, '.gitignore');
  const defaultGitignore = `# Dependencies\nnode_modules/\nskills_modules/\n`;

  if (!await fs.pathExists(gitignorePath)) {
    await fs.writeFile(gitignorePath, defaultGitignore);
    console.log(chalk.green('✓ 已创建 .gitignore'));
  } else {
    // 如果已存在，检查是否已有 skills_modules，没有则追加
    let content = await fs.readFile(gitignorePath, 'utf-8');
    if (!content.includes('skills_modules')) {
      content += '\n# Skills dependencies\nskills_modules/\n';
      await fs.writeFile(gitignorePath, content);
      console.log(chalk.green('✓ 已更新 .gitignore'));
    }
  }

  console.log(chalk.green('✓ 已创建 skills.json'));
  console.log(chalk.dim(`\n下一步：`));
  console.log(chalk.dim(`  skills add <package>   添加依赖`));
  console.log(chalk.dim(`  skills install         安装所有依赖`));
};

const NpmRunner = require('../core/npm-runner');
const SkillsJson = require('../core/skills-json');
const fs = require('fs-extra');
const path = require('path');
const spinner = require('../utils/spinner');
const chalk = require('chalk');
const { validateSkill } = require('../utils/validator');

module.exports = async function publish(options) {
  const spin = spinner('正在验证 Skill 包...');

  try {
    // 1. 验证 package.json 存在
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (!await fs.pathExists(packageJsonPath)) {
      spin.fail('package.json 不存在');
      console.log(chalk.yellow('提示: Skills 包必须是 npm 包格式'));
      return;
    }

    // 2. 验证 skills.json 存在
    const skillsJson = new SkillsJson();
    if (!await skillsJson.exists()) {
      spin.fail('skills.json 不存在');
      console.log(chalk.yellow('提示: Skills 包必须包含 skills.json'));
      return;
    }

    // 3. 验证格式
    const skillConfig = await skillsJson.read();
    const validation = validateSkill(skillConfig);
    if (!validation.valid) {
      spin.fail('skills.json 验证失败');
      validation.errors.forEach(err => console.log(chalk.red(`  ✗ ${err}`)));
      return;
    }

    // 4. 调用 npm publish
    spin.text = '正在发布到 Registry...';
    const npm = new NpmRunner();
    await npm.publish({
      tag: options.tag,
      access: 'public'
    });

    // 5. 读取包名和版本
    const packageJson = await fs.readJson(packageJsonPath);

    spin.succeed(`发布成功: ${packageJson.name}@${packageJson.version}`);
    console.log(chalk.green(`\n✨ 已发布到 ${await npm.getRegistry()}`));
    console.log(chalk.dim(`\n使用: skills add ${packageJson.name}`));

  } catch (error) {
    spin.fail(`发布失败: ${error.message}`);
    throw error;
  }
};

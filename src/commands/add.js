const NpmRunner = require('../core/npm-runner');
const SkillsJson = require('../core/skills-json');
const spinner = require('../utils/spinner');
const chalk = require('chalk');

module.exports = async function add(packages, options) {
  const spin = spinner(`正在添加 ${packages.join(', ')}...`);

  try {
    // 1. 更新 skills.json
    const skillsJson = new SkillsJson();
    if (!await skillsJson.exists()) {
      spin.fail('skills.json 不存在，请先运行 skills init');
      return;
    }

    await skillsJson.addDependency(packages, options.saveDev);

    // 2. 调用 npm install
    const npm = new NpmRunner();
    await npm.install(packages, {
      saveDev: options.saveDev,
      save: true
    });

    spin.succeed(`已添加 ${packages.join(', ')}`);

    // 3. 输出提示
    console.log(chalk.dim(`\n已更新 skills.json 中的 ${options.saveDev ? 'devDependencies' : 'dependencies'}`));

  } catch (error) {
    spin.fail(`添加失败: ${error.message}`);
    throw error;
  }
};

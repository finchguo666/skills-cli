const NpmRunner = require('../core/npm-runner');
const SkillsJson = require('../core/skills-json');
const spinner = require('../utils/spinner');
const chalk = require('chalk');

module.exports = async function remove(packages) {
  const spin = spinner(`正在移除 ${packages.join(', ')}...`);

  try {
    // 1. 更新 skills.json
    const skillsJson = new SkillsJson();
    if (!await skillsJson.exists()) {
      spin.fail('skills.json 不存在，请先运行 skills init');
      return;
    }

    // 获取完整包名
    const fullPackageNames = packages.map(pkg =>
      pkg.startsWith('@') ? pkg : `@skills/${pkg}`
    );

    await skillsJson.removeDependency(packages);

    // 2. 获取安装目录配置
    const skillsData = await skillsJson.read();
    const modulesDir = skillsData && skillsData.installDirectory
      ? skillsData.installDirectory
      : 'skills_modules';

    // 3. 调用 npm uninstall
    const npm = new NpmRunner(process.cwd(), modulesDir);
    await npm.uninstall(fullPackageNames);

    spin.succeed(`已移除 ${packages.join(', ')}`);
    console.log(chalk.dim(`\n已更新 skills.json`));

  } catch (error) {
    spin.fail(`移除失败: ${error.message}`);
    throw error;
  }
};

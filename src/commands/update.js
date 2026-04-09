const NpmRunner = require('../core/npm-runner');
const SkillsJson = require('../core/skills-json');
const ConfigManager = require('../core/config');
const spinner = require('../utils/spinner');
const chalk = require('chalk');

module.exports = async function update(packages) {
  const spin = spinner('正在更新 Skills 依赖...');

  try {
    // 1. 检查 skills.json 是否存在
    const skillsJson = new SkillsJson();
    if (!await skillsJson.exists()) {
      spin.fail('skills.json 不存在，请先运行 skills init');
      return;
    }

    // 2. 如果没有指定包，获取所有依赖
    let targetPackages = packages;
    if (!packages || packages.length === 0) {
      const deps = await skillsJson.getDependencies();
      const devDeps = await skillsJson.getDevDependencies();
      targetPackages = [...Object.keys(deps), ...Object.keys(devDeps)];
    }

    // 3. 获取安装目录配置
    const skillsData = await skillsJson.read();
    const modulesDir = skillsData && skillsData.installDirectory
      ? skillsData.installDirectory
      : 'skills_modules';

    // 4. 执行 npm update
    const npm = new NpmRunner(process.cwd(), modulesDir);
    await npm.update(targetPackages);

    // 5. 重新注册优先级
    // stop spinner 并重新输出提示，避免 npm 输出后 spinner 错乱
    spin.stop();
    console.log(chalk.cyan('  正在重新注册 Skills 优先级...'));
    const config = new ConfigManager();
    await config.registerInstalledSkills(modulesDir);

    const spin2 = spinner('');
    spin2.succeed('Skills 更新完成');

  } catch (error) {
    spin.fail(`更新失败: ${error.message}`);
    throw error;
  }
};

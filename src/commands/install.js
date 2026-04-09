const NpmRunner = require('../core/npm-runner');
const SkillsJson = require('../core/skills-json');
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

    // 2. 获取所有 skills 依赖
    const deps = await skillsJson.getDependencies();
    const devDeps = await skillsJson.getDevDependencies();
    const allDeps = { ...deps, ...devDeps };
    const packages = Object.keys(allDeps);

    // 3. 获取安装目录配置，默认使用 skills_modules
    const skillsData = await skillsJson.read();
    const modulesDir = skillsData && skillsData.installDirectory
      ? skillsData.installDirectory
      : 'skills_modules';

    // 4. 调用 npm install 安装 skills 依赖到指定目录
    const npm = new NpmRunner(process.cwd(), modulesDir);
    await npm.install(packages);

    spin.succeed('Skills 依赖安装完成');

    // 输出已安装的 Skills
    const skillNames = Object.keys(allDeps);

    if (skillNames.length > 0) {
      console.log(chalk.cyan('\n已安装的 Skills:'));
      for (const name of skillNames) {
        console.log(chalk.dim(`  ${name}`));
      }
    }

  } catch (error) {
    spin.fail(`安装失败: ${error.message}`);
    throw error;
  }
};

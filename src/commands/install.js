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

    // 5. 注册优先级
    // stop spinner 并重新输出提示，避免 npm 输出后 spinner 错乱
    spin.stop();
    console.log(chalk.cyan('  正在注册 Skills 优先级...'));
    const config = new ConfigManager();
    await config.registerInstalledSkills(modulesDir);

    const spin2 = spinner('');
    spin2.succeed('Skills 安装完成');

    // 输出已安装的 Skills
    const skillNames = Object.keys(allDeps);

    if (skillNames.length > 0) {
      console.log(chalk.cyan('\n已安装的 Skills:'));
      // 一次性读取所有优先级，减少 IO 操作
      const allPriorities = await config.getPriorities();
      for (const name of skillNames) {
        const priority = allPriorities[name] || 50;
        console.log(chalk.dim(`  ${name} (优先级: ${priority})`));
      }
    }

  } catch (error) {
    spin.fail(`安装失败: ${error.message}`);
    throw error;
  }
};

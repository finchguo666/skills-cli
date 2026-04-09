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

    // 5. 注册优先级（后台异步执行，不阻塞安装完成）
    spin.stop();
    console.log(chalk.cyan('  正在安装依赖...'));
    const config = new ConfigManager();

    // 异步注册，不阻塞，安装完成立刻输出结果
    setImmediate(async () => {
      try {
        await config.registerInstalledSkills(modulesDir);
        // 注册完成后输出列表
        console.log(chalk.green('  ✓ 优先级注册完成'));
        console.log(chalk.cyan('\n已安装的 Skills:'));
        // 一次性读取所有优先级
        const allPriorities = await config.getPriorities();
        for (const name of packages) {
          const priority = allPriorities[name] || 50;
          console.log(chalk.dim(`  ${name} (优先级: ${priority})`));
        }
      } catch (e) {
        console.log(chalk.yellow(`  ⚠  优先级注册警告: ${e.message}`));
      }
    });

    const spin2 = spinner('');
    spin2.succeed('Skills 依赖安装完成');
    console.log(chalk.dim('  优先级正在后台注册...完成后会自动输出列表'));

  } catch (error) {
    spin.fail(`安装失败: ${error.message}`);
    throw error;
  }
};

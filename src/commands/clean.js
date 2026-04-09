const fs = require('fs-extra');
const path = require('path');
const SkillsJson = require('../core/skills-json');
const spinner = require('../utils/spinner');
const chalk = require('chalk');

module.exports = async function clean() {
  const spin = spinner('正在清理 Skills 依赖...');

  try {
    // 1. 检查 skills.json 是否存在
    const skillsJson = new SkillsJson();
    if (!await skillsJson.exists()) {
      spin.fail('skills.json 不存在，请先运行 skills init');
      return;
    }

    // 2. 获取安装目录
    const skillsData = await skillsJson.read();
    const modulesDir = skillsData && skillsData.installDirectory
      ? skillsData.installDirectory
      : 'skills_modules';

    const modulesPath = path.join(process.cwd(), modulesDir);

    // 3. 删除目录
    if (await fs.pathExists(modulesPath)) {
      await fs.remove(modulesPath);
      spin.succeed(`已清理 ${modulesDir}`);
    } else {
      spin.succeed(`${modulesDir} 不存在，无需清理`);
    }

  } catch (error) {
    spin.fail(`清理失败: ${error.message}`);
    throw error;
  }
};

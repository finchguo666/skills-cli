const fs = require('fs-extra');
const path = require('path');
const os = require('os');

class ConfigManager {
  constructor() {
    this.configDir = path.join(os.homedir(), '.skills');
    this.configPath = path.join(this.configDir, 'config.json');
    this.priorityPath = path.join(this.configDir, 'priorities.json');
  }

  async init() {
    await fs.ensureDir(this.configDir);
    if (!await fs.pathExists(this.configPath)) {
      await this.write({});
    }
    if (!await fs.pathExists(this.priorityPath)) {
      await fs.writeJson(this.priorityPath, {});
    }
  }

  async read() {
    await this.init();
    return await fs.readJson(this.configPath);
  }

  async write(data) {
    await this.init();
    await fs.writeJson(this.configPath, data, { spaces: 2 });
  }

  async get(key, defaultValue = null) {
    const config = await this.read();
    return config[key] !== undefined ? config[key] : defaultValue;
  }

  async set(key, value) {
    const config = await this.read();
    config[key] = value;
    await this.write(config);
  }

  // 优先级管理
  async getPriorities() {
    await this.init();
    try {
      return await fs.readJson(this.priorityPath);
    } catch (error) {
      // 如果文件损坏或不存在，返回空对象
      await fs.writeJson(this.priorityPath, {}, { spaces: 2 });
      return {};
    }
  }

  async setPriority(skillName, priority) {
    const priorities = await this.getPriorities();
    priorities[skillName] = priority;
    await fs.writeJson(this.priorityPath, priorities, { spaces: 2 });
  }

  async getPriority(skillName) {
    const priorities = await this.getPriorities();
    return priorities[skillName] || 50; // 默认优先级 50
  }

  // 注册已安装 Skills 的优先级
  async registerInstalledSkills(nodeModulesPath) {
    const skillsPath = path.join(nodeModulesPath, '@skills');
    if (!await fs.pathExists(skillsPath)) {
      return;
    }

    const skills = await fs.readdir(skillsPath);

    for (const skill of skills) {
      const skillJsonPath = path.join(skillsPath, skill, 'skills.json');
      if (await fs.pathExists(skillJsonPath)) {
        const skillConfig = await fs.readJson(skillJsonPath);
        const priority = skillConfig.priority || 50;
        await this.setPriority(`@skills/${skill}`, priority);
      }
    }
  }
}

module.exports = ConfigManager;

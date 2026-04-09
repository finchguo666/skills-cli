const fs = require('fs-extra');
const fsNative = require('fs');
const path = require('path');
const os = require('os');
const util = require('util');

const readdir = util.promisify(fsNative.readdir);

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
  // 简化实现，直接使用 fs.readdir 不返回 dirent，减少内存分配
  async registerInstalledSkills(nodeModulesPath) {
    // 遍历整个安装目录，找到所有包含 skills.json 的包，不管在哪个 scope
    if (!await fs.pathExists(nodeModulesPath)) {
      return;
    }

    // 一次性读取所有当前优先级，减少 IO
    const priorities = await this.getPriorities();
    let changed = false;

    // 使用 fs.readdir 简单实现，更省内存
    const items = await readdir(nodeModulesPath);

    for (const item of items) {
      const itemPath = path.join(nodeModulesPath, item);
      // 检查是否是目录（同步检查更快更省内存）
      try {
        const stat = fsNative.statSync(itemPath);
        if (!stat.isDirectory()) continue;
      } catch (e) {
        continue;
      }

      // 如果是 scope 目录（以 @ 开头），遍历里面的包
      if (item.startsWith('@')) {
        const packages = await readdir(itemPath);
        for (const pkg of packages) {
          try {
            const pkgPath = path.join(itemPath, pkg);
            const stat = fsNative.statSync(pkgPath);
            if (!stat.isDirectory()) continue;
            await this.tryRegisterSkill(pkgPath, `${item}/${pkg}`, priorities);
            changed = true;
          } catch (e) {
            continue;
          }
        }
      } else {
        // unscoped 包
        try {
          await this.tryRegisterSkill(itemPath, item, priorities);
          changed = true;
        } catch (e) {
          continue;
        }
      }
    }

    // 如果有变更，只写入一次
    if (changed) {
      await fs.writeJson(this.priorityPath, priorities, { spaces: 2 });
    }
  }

  // 尝试注册单个包
  async tryRegisterSkill(packagePath, fullPackageName, priorities) {
    const skillJsonPath = path.join(packagePath, 'skills.json');
    if (await fs.pathExists(skillJsonPath)) {
      const skillConfig = await fs.readJson(skillJsonPath);
      const priority = skillConfig.priority || 50;
      priorities[fullPackageName] = priority;
    }
  }
}

module.exports = ConfigManager;

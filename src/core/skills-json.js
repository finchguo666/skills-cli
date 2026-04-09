const fs = require('fs-extra');
const path = require('path');

class SkillsJson {
  constructor(cwd = process.cwd()) {
    this.cwd = cwd;
    this.path = path.join(cwd, 'skills.json');
  }

  // 读取 skills.json
  async read() {
    if (!await fs.pathExists(this.path)) {
      return null;
    }
    const content = await fs.readFile(this.path, 'utf-8');
    return JSON.parse(content);
  }

  // 写入 skills.json
  async write(data) {
    const content = JSON.stringify(data, null, 2);
    await fs.writeFile(this.path, content, 'utf-8');
  }

  // 检查是否存在
  async exists() {
    return await fs.pathExists(this.path);
  }

  // 获取依赖列表
  async getDependencies() {
    const data = await this.read();
    if (!data) return {};
    return data.dependencies || {};
  }

  // 获取开发依赖列表
  async getDevDependencies() {
    const data = await this.read();
    if (!data) return {};
    return data.devDependencies || {};
  }

  // 添加依赖
  async addDependency(packages, isDev = false) {
    const data = await this.read();
    if (!data) {
      throw new Error('skills.json 不存在，请先运行 skills init');
    }

    const target = isDev ? 'devDependencies' : 'dependencies';
    if (!data[target]) data[target] = {};

    for (const pkg of packages) {
      const { name, version } = this.parsePackageSpec(pkg);
      data[target][name] = version || 'latest';
    }

    await this.write(data);
    return data;
  }

  // 移除依赖
  async removeDependency(packages) {
    const data = await this.read();
    if (!data) return;

    for (const pkg of packages) {
      const name = pkg.startsWith('@') ? pkg : `@skills/${pkg}`;
      if (data.dependencies && data.dependencies[name]) {
        delete data.dependencies[name];
      }
      if (data.devDependencies && data.devDependencies[name]) {
        delete data.devDependencies[name];
      }
    }

    await this.write(data);
    return data;
  }

  // 解析包规格（@skills/xxx@1.0.0）
  parsePackageSpec(spec) {
    const atIndex = spec.lastIndexOf('@');
    if (atIndex === 0) {
      return { name: spec, version: null };
    }
    if (atIndex > 0) {
      return {
        name: spec.substring(0, atIndex),
        version: spec.substring(atIndex + 1)
      };
    }
    return { name: spec, version: null };
  }

  // 生成模板
  async generateTemplate(name = 'my-project') {
    const template = {
      name: name,
      version: '1.0.0',
      description: '',
      // 安装目录，默认为 skills_modules，如需使用 node_modules 可改为 "node_modules"
      installDirectory: 'skills_modules',
      dependencies: {},
      devDependencies: {},
      priorityOverrides: {},
      config: {}
    };
    await this.write(template);
    return template;
  }
}

module.exports = SkillsJson;

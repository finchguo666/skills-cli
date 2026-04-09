const { execa } = require('execa');
const fs = require('fs-extra');
const path = require('path');

class NpmRunner {
  constructor(cwd = process.cwd(), modulesFolder = null) {
    this.cwd = cwd;
    this.modulesFolder = modulesFolder;
  }

  // 获取 Registry 配置
  async getRegistry() {
    // 优先读取 skills.json 中的配置
    const skillsJsonPath = path.join(this.cwd, 'skills.json');
    if (await fs.pathExists(skillsJsonPath)) {
      const skillsJson = await fs.readJson(skillsJsonPath);
      if (skillsJson.registries && skillsJson.registries.default) {
        return skillsJson.registries.default;
      }
    }

    // 默认使用 npm 公共仓库
    return 'https://registry.npmjs.org';
  }

  // 执行 npm install
  async install(packages = [], options = {}) {
    const args = ['install'];

    // 指定 modules 安装目录（使用 --name=value 格式避免npm误解析为包名）
    if (this.modulesFolder) {
      args.push(`--modules-folder=${this.modulesFolder}`);
    }

    if (packages.length > 0) {
      args.push(...packages);
    }

    if (options.saveDev) {
      args.push('--save-dev');
    } else if (options.save) {
      args.push('--save');
    }

    if (options.global) {
      args.push('-g');
    }

    const registry = await this.getRegistry();
    args.push(`--registry=${registry}`);

    const result = await execa('npm', args, {
      cwd: this.cwd,
      stdio: 'inherit'
    });

    return result;
  }

  // 执行 npm uninstall
  async uninstall(packages, options = {}) {
    const args = ['uninstall'];

    // 指定 modules 安装目录
    if (this.modulesFolder) {
      args.push(`--modules-folder=${this.modulesFolder}`);
    }

    args.push(...packages);

    if (options.global) {
      args.push('-g');
    }

    const result = await execa('npm', args, {
      cwd: this.cwd,
      stdio: 'inherit'
    });

    return result;
  }

  // 执行 npm update
  async update(packages = []) {
    const args = ['update'];

    // 指定 modules 安装目录
    if (this.modulesFolder) {
      args.push(`--modules-folder=${this.modulesFolder}`);
    }

    if (packages.length > 0) {
      args.push(...packages);
    }

    const result = await execa('npm', args, {
      cwd: this.cwd,
      stdio: 'inherit'
    });

    return result;
  }

  // 执行 npm publish
  async publish(options = {}) {
    const args = ['publish'];

    if (options.tag) {
      args.push('--tag', options.tag);
    }

    if (options.access) {
      args.push('--access', options.access);
    }

    const registry = await this.getRegistry();
    args.push(`--registry=${registry}`);

    const result = await execa('npm', args, {
      cwd: this.cwd,
      stdio: 'inherit'
    });

    return result;
  }

  // 执行 npm login
  async login() {
    const result = await execa('npm', ['login'], {
      cwd: this.cwd,
      stdio: 'inherit'
    });
    return result;
  }

  // 执行 npm view（获取包信息）
  async view(packageName, field = null) {
    const args = ['view', packageName];
    if (field) {
      args.push(field);
    }

    const { stdout } = await execa('npm', args, {
      cwd: this.cwd
    });

    try {
      return JSON.parse(stdout);
    } catch {
      return stdout;
    }
  }

  // 执行 npm search
  async search(keyword) {
    const args = ['search', keyword, '--json'];

    const { stdout } = await execa('npm', args, {
      cwd: this.cwd
    });

    try {
      return JSON.parse(stdout);
    } catch {
      return [];
    }
  }
}

module.exports = NpmRunner;

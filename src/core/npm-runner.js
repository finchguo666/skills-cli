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

  // 后处理：将 prefix 安装的 node_modules 移动到目标目录
  async postInstallMove() {
    if (!this.modulesFolder) return;

    const targetDir = path.resolve(this.cwd, this.modulesFolder);
    const tempNodeModules = path.resolve(this.cwd, this.modulesFolder, 'node_modules');
    const tempPackageJson = path.resolve(this.cwd, this.modulesFolder, 'package.json');
    const tempPackageLock = path.resolve(this.cwd, this.modulesFolder, 'package-lock.json');

    // 确保目标目录存在
    await fs.ensureDir(targetDir);

    // 如果临时 node_modules 存在，移动内容到目标
    if (await fs.pathExists(tempNodeModules)) {
      const items = await fs.readdir(tempNodeModules);
      for (const item of items) {
        const src = path.join(tempNodeModules, item);
        const dest = path.join(targetDir, item);
        await fs.move(src, dest, { overwrite: true });
      }
      // 删除空的 node_modules
      await fs.remove(tempNodeModules);
    }

    // 删除临时的 package.json 和 lock 文件（保持当前目录的就可以了）
    await fs.remove(tempPackageJson);
    await fs.remove(tempPackageLock);
  }

  // 执行 npm install
  async install(packages = [], options = {}) {
    const args = ['install'];

    // 指定 modules 安装目录
    if (this.modulesFolder) {
      // 使用 --prefix 安装，之后再移动内容
      args.push(`--prefix=${this.modulesFolder}`);
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

    // 如果自定义了安装目录，移动文件
    if (this.modulesFolder) {
      await this.postInstallMove();
    }

    return result;
  }

  // 执行 npm uninstall
  async uninstall(packages, options = {}) {
    const args = ['uninstall'];

    // 指定 modules 安装目录
    if (this.modulesFolder) {
      args.push(`--prefix=${this.modulesFolder}`);
    }

    args.push(...packages);

    if (options.global) {
      args.push('-g');
    }

    const result = await execa('npm', args, {
      cwd: this.cwd,
      stdio: 'inherit'
    });

    // 如果自定义了安装目录，清理
    if (this.modulesFolder) {
      await this.postInstallMove();
    }

    return result;
  }

  // 执行 npm update
  async update(packages = []) {
    const args = ['update'];

    // 指定 modules 安装目录
    if (this.modulesFolder) {
      args.push(`--prefix=${this.modulesFolder}`);
    }

    if (packages.length > 0) {
      args.push(...packages);
    }

    const result = await execa('npm', args, {
      cwd: this.cwd,
      stdio: 'inherit'
    });

    // 如果自定义了安装目录，移动文件
    if (this.modulesFolder) {
      await this.postInstallMove();
    }

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

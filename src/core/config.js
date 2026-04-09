const fs = require('fs-extra');
const path = require('path');
const os = require('os');

class ConfigManager {
  constructor() {
    this.configDir = path.join(os.homedir(), '.skills');
    this.configPath = path.join(this.configDir, 'config.json');
  }

  async init() {
    await fs.ensureDir(this.configDir);
    if (!await fs.pathExists(this.configPath)) {
      await this.write({});
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
}

module.exports = ConfigManager;

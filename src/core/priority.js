const ConfigManager = require('./config');

class PriorityManager {
  constructor() {
    this.config = new ConfigManager();
  }

  // 获取技能的最终优先级（考虑本地覆盖）
  async getPriority(skillName, skillJsonPriority = null) {
    // 从全局配置获取
    const globalPriority = await this.config.getPriority(skillName);

    // 如果 skills.json 中有优先级定义，以它为准
    if (skillJsonPriority !== null && typeof skillJsonPriority === 'number') {
      return skillJsonPriority;
    }

    return globalPriority;
  }

  // 排序技能列表按优先级（降序）
  async sortByPriority(skills) {
    // skills 格式: [{ name, priority?: number }, ...]
    const sorted = [...skills];

    sorted.sort(async (a, b) => {
      const priorityA = await this.getPriority(a.name, a.priority);
      const priorityB = await this.getPriority(b.name, b.priority);
      return priorityB - priorityA;
    });

    return sorted;
  }

  // 应用本地优先级覆盖
  applyOverrides(priorities, overrides) {
    if (!overrides || typeof overrides !== 'object') {
      return priorities;
    }

    const result = { ...priorities };

    for (const [skillName, overridePriority] of Object.entries(overrides)) {
      result[skillName] = overridePriority;
    }

    return result;
  }
}

module.exports = PriorityManager;

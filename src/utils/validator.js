function validateSkill(config) {
  const errors = [];

  // 必需字段检查
  if (!config) {
    errors.push('skills.json 不能为空');
    return { valid: false, errors };
  }

  if (!config.name) {
    errors.push('缺少 "name" 字段');
  }

  // 可选字段类型检查
  if (config.priority !== undefined &&
      (typeof config.priority !== 'number' || config.priority < 0 || config.priority > 100)) {
    errors.push('priority 必须是 0-100 的数字');
  }

  if (config.capabilities !== undefined && !Array.isArray(config.capabilities)) {
    errors.push('capabilities 必须是数组');
  }

  if (config.tags !== undefined && !Array.isArray(config.tags)) {
    errors.push('tags 必须是数组');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = { validateSkill };

# @skills-cli/cli

> Skills 包管理工具 - 基于 npm 生态的可扩展技能包管理器

[![npm version](https://badge.fury.io/js/@skills-cli%2Fcli.svg)](https://badge.fury.io/js/@skills-cli%2Fcli)

Skills CLI 是一个基于 npm 生态的 Skills 包管理工具，核心策略：**调用 npm 完成基础操作，自身只处理 skills.json 和扩展功能**。

## 📦 安装

```bash
npm install -g @skills-cli/cli
```

## 🚀 快速开始

```bash
# 初始化项目
skills init

# 添加 Skill
skills add @skills-cli/vue2-springboot-mybatis

# 安装所有依赖
skills install

# 查看已安装
skills list
```

## 📖 命令速查

| 命令 | 别名 | 说明 |
|------|------|------|
| `skills init` | - | 初始化 `skills.json` |
| `skills install` | `i` | 安装所有依赖 |
| `skills add <packages>` | `a` | 添加 Skills 依赖 |
| `skills remove <packages>` | `rm` | 移除 Skills 依赖 |
| `skills update` | `up` | 更新 Skills 依赖 |
| `skills publish` | - | 发布 Skill 包 |
| `skills search <keyword>` | `s` | 搜索 Skills |
| `skills info <package>` | - | 查看 Skill 详情 |
| `skills login` | - | 登录 npm |
| `skills list` | `ls` | 列出已安装 |

**Options:**
- `skills add -D <pkg>` - 保存到 devDependencies
- `skills publish --tag beta` - 发布到 beta 标签

## 🎯 已发布 Skills

| Skill | Description |
|-------|------|
| [@skills-cli/demo-skills](https://www.npmjs.com/package/@skills-cli/demo-skills) | Demo Skill 示例 |
| [@skills-cli/vue2-springboot-mybatis](https://www.npmjs.com/package/@skills-cli/vue2-springboot-mybatis) | Vue2 + SpringBoot + MyBatis 全栈代码生成 |

---

## 详细文档

### 架构设计

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Skills CLI                                    │
├─────────────────────────────────────────────────────────────────────┤
│  命令层：init / install / add / remove / update / publish          │
│             search / info / login / list                            │
├─────────────────────────────────────────────────────────────────────┤
│  核心层：                                                     │
│  • skills.json 读写器                                           │
│  • npm 命令执行器                                             │
│  • 配置管理器（~/.skills/）                                    │
│  • 优先级注册器                                               │
├─────────────────────────────────────────────────────────────────────┤
│  底层：                                                       │
│  • commander - CLI 框架                                        │
│  • execa - 调用 npm 命令                                       │
│  • fs-extra - 文件操作                                         │
│  • chalk - 彩色输出                                           │
│  • ora - loading 动画                                         │
└─────────────────────────────────────────────────────────────────────┘
```

### skills.json 格式

**项目配置：**
```json
{
  "name": "my-project",
  "version": "1.0.0",
  "dependencies": {
    "@skills-cli/vue2-springboot-mybatis": "^1.0.0"
  },
  "priorityOverrides": {
    "@skills-cli/vue2-springboot-mybatis": 80
  }
}
```

**Skill 包配置：**
```json
{
  "name": "vue2-springboot-mybatis",
  "version": "1.0.0",
  "description": "Universal coding assistance skills",
  "priority": 80,
  "tags": ["vue2", "springboot", "mybatis"],
  "capabilities": ["generate-vue2-crud-page", "generate-springboot-controller"]
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | ✅ | 包名 |
| `version` | string | ✅ | 版本 |
| `priority` | number | - | 优先级 0-100，默认 50 |
| `tags` | string[] | - | 标签，用于搜索 |
| `capabilities` | string[] | - | 能力列表 |

### 优先级系统

- 优先级范围：**0 - 100**
- 默认优先级：**50**
- **数字越大优先级越高**
- 高优先级 Skill 覆盖低优先级的相同能力
- 支持项目级覆盖 `priorityOverrides`
- 全局配置存储：`~/.skills/priorities.json`

### 项目结构

```
skills-cli/
├── bin/
│   └── skills.js       # CLI 入口
├── src/
│   ├── commands/        # 命令实现
│   ├── core/            # 核心模块
│   │   ├── npm-runner.js
│   │   ├── skills-json.js
│   │   ├── config.js
│   │   └── priority.js
│   ├── utils/          # 工具函数
│   └── templates/
│       └── skills.json  # 模板
├── package.json
└── README.md
```

## 开发

```bash
# 克隆
git clone https://github.com/your-username/skills-cli.git
cd skills-cli
npm install
npm link  # 全局链接

skills --help  # 测试
```

## 创建并发布新 Skill

```bash
mkdir my-skill && cd my-skill
npm init -y --scope=skills-cli
skills init
# 编辑 skills.json
# 编写代码
npm publish --access public
```

## 许可证

MIT © [finchguo](https://github.com/finchguo)

---

**skills-cli** - 让技能分发变得简单 🎉

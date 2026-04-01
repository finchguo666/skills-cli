# @skills-cli/cli

> Skills 包管理工具 - 基于 npm 生态的可扩展技能包管理器

[![npm version](https://badge.fury.io/js/@skills-cli%2Fcli.svg)](https://badge.fury.io/js/@skills-cli%2Fcli)

Skills CLI 是一个基于 npm 生态的 Skills 包管理工具，核心策略是：**调用 npm 完成基础操作，自身只处理 skills.json 和扩展功能**。

## 📖 架构设计

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

## 📦 安装

```bash
npm install -g @skills-cli/cli
```

安装完成后即可使用 `skills` 命令：

```bash
skills --help
```

## 🚀 快速开始

### 作为 Skill 使用者

```bash
# 1. 初始化新项目
mkdir my-project && cd my-project
skills init

# 2. 添加 Skill 依赖
skills add @skills-cli/vue2-springboot-mybatis

# 3. 安装所有依赖
skills install

# 4. 查看已安装
skills list

# 5. 搜索 Skills
skills search vue2
```

### 作为 Skill 开发者

```bash
# 1. 创建 Skill 项目
mkdir my-skill && cd my-skill
npm init -y --scope=skills-cli
skills init

# 2. 编辑 skills.json 添加你的技能配置
# 3. 编写代码

# 4. 发布
skills login
skills publish
```

## 📖 命令说明

| 命令 | 别名 | 说明 |
|------|------|------|
| `skills init` | - | 初始化 `skills.json` |
| `skills install` | `skills i` | 安装 `skills.json` 中声明的所有依赖 |
| `skills add <packages...>` | `skills a` | 添加 Skills 依赖 |
| `skills remove <packages...>` | `skills rm` | 移除 Skills 依赖 |
| `skills update [packages...]` | `skills up` | 更新 Skills 依赖 |
| `skills publish` | - | 发布 Skill 包到 npm Registry |
| `skills search <keyword>` | `skills s` | 搜索 Skills |
| `skills info <package>` | - | 查看 Skill 详细信息 |
| `skills login` | - | 登录到 npm Registry |
| `skills list` | `skills ls` | 列出已安装的 Skills |

### `skills add` 选项

```bash
skills add <package...>
skills add -D <package...>      # 保存到 devDependencies
```

### `skills publish` 选项

```bash
skills publish --tag beta     # 发布到 beta 标签
```

## 📄 skills.json 格式

### 使用者项目

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "description": "My project",
  "dependencies": {
    "@skills-cli/vue2-springboot-mybatis": "^1.0.0"
  },
  "devDependencies": {
    "@skills-cli/demo-skills": "latest"
  },
  "priorityOverrides": {
    "@skills-cli/vue2-springboot-mybatis": 80
  },
  "registries": {
    "default": "https://registry.npmjs.org"
  },
  "config": {
    // 自定义配置
  }
}
```

### Skill 包

```json
{
  "name": "vue2-springboot-mybatis",
  "version": "1.0.0",
  "description": "Universal coding assistance skills for Vue2 + SpringBoot + MyBatis",
  "priority": 80,
  "tags": ["vue2", "springboot", "mybatis", "code-generation"],
  "capabilities": [
    "generate-vue2-component",
    "generate-vue2-crud-page",
    "generate-springboot-controller",
    "generate-mybatis-entity"
  ],
  "dependencies": {},
  "priorityOverrides": {},
  "config": {}
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | ✅ | 包名 |
| `version` | string | ✅ | 版本号 |
| `description` | string | - | 描述 |
| `priority` | number | - | 优先级 (0-100)，默认 50 |
| `tags` | string[] | - | 标签，用于搜索 |
| `capabilities` | string[] | - | 能力列表，声明这个 Skill 提供什么能力 |
| `dependencies` | object | - | npm 依赖 |
| `priorityOverrides` | object | - | 优先级覆盖 |
| `registries.default` | string | - | 自定义 npm registry |
| `config` | object | - | 自定义配置 |

## ⚡️ 优先级

Skills 使用优先级系统解决多个 Skill 提供相同能力时的覆盖问题：

- **优先级范围**：`0 - 100`
- **默认优先级**：`50`
- **数字越大优先级越高**
- 高优先级 Skill 会覆盖低优先级 Skill 的相同能力
- 可以在项目 `skills.json` 中通过 `priorityOverrides` 覆盖全局优先级

优先级存储在本地：`~/.skills/priorities.json`

## 📁 项目结构

```
skills-cli/
├── bin/
│   └── skills.js              # CLI 入口
├── src/
│   ├── commands/              # 命令实现
│   │   ├── init.js
│   │   ├── install.js
│   │   ├── add.js
│   │   ├── remove.js
│   │   ├── update.js
│   │   ├── publish.js
│   │   ├── search.js
│   │   ├── info.js
│   │   ├── login.js
│   │   └── list.js
│   ├── core/
│   │   ├── npm-runner.js      # npm 命令执行器
│   │   ├── skills-json.js     # skills.json 读写器
│   │   ├── config.js          # 配置管理器
│   │   └── priority.js        # 优先级管理
│   ├── utils/
│   │   ├── logger.js          # 日志输出
│   │   ├── spinner.js         # 加载动画
│   │   └── validator.js       # 格式验证
│   └── templates/
│       └── skills.json        # 模板文件
├── package.json
└── README.md
```

## 🎯 发布到 npm 的 Skills

以下是已发布到 npm 的官方 Skills：

| Skill | 描述 | Version |
|-------|------|---------|
| [@skills-cli/demo-skills](https://www.npmjs.com/package/@skills-cli/demo-skills) | Demo Skill 示例 | [![npm version](https://badge.fury.io/js/@skills-cli%2Fdemo-skills.svg)](https://badge.fury.io/js/@skills-cli%2Fdemo-skills) |
| [@skills-cli/vue2-springboot-mybatis](https://www.npmjs.com/package/@skills-cli/vue2-springboot-mybatis) | Vue2 + SpringBoot + MyBatis 全栈代码生成 | [![npm version](https://badge.fury.io/js/@skills-cli%2Fvue2-springboot-mybatis.svg)](https://badge.fury.io/js/@skills-cli%2Fvue2-springboot-mybatis) |

## 🛠️ 开发

```bash
# 克隆项目
git clone https://github.com/your-username/skills-cli.git
cd skills-cli
npm install

# 本地链接开发
npm link

# 现在可以全局使用 skills 命令
skills --help
```

## 📝 发布新 Skill 步骤

1. 在 npmjs.com 创建 `skills-cli` 组织（需要权限）
2. 创建项目目录
```bash
mkdir my-skill && cd my-skill
npm init -y --scope=skills-cli
skills init
```
3. 编辑 `skills.json` 填写 Skill 信息
4. 实现功能
5. 发布
```bash
npm publish --access public
```

## 📄 许可证

MIT © [finchguo](https://github.com/finchguo)

## 相关项目

- [skills-cli-use-demo](https://github.com/finchguo/skills-cli-use-demo) - Vue 2 示例工程，展示如何在项目中使用 skills-cli
- [@skills-cli/vue2-springboot-mybatis](https://www.npmjs.com/package/@skills-cli/vue2-springboot-mybatis) - Vue2 + SpringBoot + MyBatis 全栈代码生成 Skill

---

**skills-cli** 让技能分发变得简单 🎉

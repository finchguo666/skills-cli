#!/usr/bin/env node

const { Command } = require('commander');
const packageJson = require('../package.json');

const program = new Command();

program
  .name('skills')
  .description('Skills 包管理工具 - 基于 npm 生态')
  .version(packageJson.version);

// 注册命令
program
  .command('init')
  .description('初始化 skills.json')
  .action(() => require('../src/commands/init')());

program
  .command('install')
  .alias('i')
  .description('安装 skills.json 中声明的依赖')
  .action(() => require('../src/commands/install')());

program
  .command('add <packages...>')
  .alias('a')
  .description('添加 Skills 依赖')
  .option('-D, --save-dev', '保存到 devDependencies')
  .action((packages, options) =>
    require('../src/commands/add')(packages, options));

program
  .command('remove <packages...>')
  .alias('rm')
  .description('移除 Skills 依赖')
  .action((packages) =>
    require('../src/commands/remove')(packages));

program
  .command('update [packages...]')
  .alias('up')
  .description('更新 Skills 依赖')
  .action((packages) =>
    require('../src/commands/update')(packages));

program
  .command('publish')
  .description('发布 Skill 到仓库')
  .option('--tag <tag>', '发布标签 (latest, beta, alpha)', 'latest')
  .action((options) =>
    require('../src/commands/publish')(options));

program
  .command('search <keyword>')
  .alias('s')
  .description('搜索 Skills')
  .action((keyword) =>
    require('../src/commands/search')(keyword));

program
  .command('info <package>')
  .description('查看 Skill 详细信息')
  .action((packageName) =>
    require('../src/commands/info')(packageName));

program
  .command('login')
  .description('登录到 npm Registry')
  .action(() => require('../src/commands/login')());

program
  .command('list')
  .alias('ls')
  .description('列出已安装的 Skills')
  .action(() => require('../src/commands/list')());

program.parse();

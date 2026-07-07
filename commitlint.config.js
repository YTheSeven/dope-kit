// 自定义错误提示信息
const errorMessages = {
  'type-enum': () => `
❌ 提交信息格式错误：使用了不合法的 type 类型

✅ 正确的格式：type(scope?): subject

📋 可用的 type 类型：
  • feat     → 新功能
  • fix      → Bug 修复
  • docs     → 文档更新
  • style    → 代码格式（不影响功能）
  • refactor → 代码重构
  • perf     → 性能优化
  • test     → 测试相关
  • chore    → 构建/工具相关
  • revert   → 回滚提交
  • build    → 构建系统
  • ci       → CI 配置

💡 示例：
  feat: 添加用户登录功能
  fix(auth): 修复登录失败问题
  docs: 更新 API 文档
`,
  'type-empty': () => `
❌ 提交信息格式错误：缺少 type 类型

✅ 正确的格式：type(scope?): subject

💡 示例：
  feat: 添加用户登录功能
  fix: 修复按钮样式问题
`,
  'subject-empty': () => `
❌ 提交信息格式错误：缺少描述信息

✅ 正确的格式：type(scope?): subject

💡 示例：
  feat: 添加用户登录功能
  fix: 修复按钮样式问题
`,
  'subject-full-stop': () => `
❌ 提交信息格式错误：描述末尾不能有句号

❌ 错误：feat: 添加用户登录功能。
✅ 正确：feat: 添加用户登录功能
`,
  'type-case': () => `
❌ 提交信息格式错误：type 必须小写

❌ 错误：FEAT: 添加功能
✅ 正确：feat: 添加功能
`,
  'header-max-length': () => `
❌ 提交信息格式错误：标题超过 72 字符限制

请精简描述，保持简洁明了
`,
  'subject-case': () => `
❌ 提交信息格式错误：描述不能以首字母大写开头

❌ 错误：feat: 添加用户登录功能
✅ 正确：feat: 添加用户登录功能

注：中文描述不受影响，英文描述使用小写开头
`,
};

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修复
        'docs', // 文档
        'style', // 格式（不影响代码运行的变动）
        'refactor', // 重构
        'perf', // 性能优化
        'test', // 测试
        'chore', // 构建过程或辅助工具的变动
        'revert', // 回滚
        'build', // 构建
        'ci', // CI 配置
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72],
  },
  // 自定义错误提示
  plugins: [
    {
      rules: {
        'type-enum': (parsed, when, value) => {
          const { type } = parsed;
          if (!type) return [true];
          const isValid = value.includes(type);
          return [isValid, errorMessages['type-enum']()];
        },
        'type-empty': (parsed) => {
          const { type } = parsed;
          if (type) return [true];
          return [false, errorMessages['type-empty']()];
        },
        'subject-empty': (parsed) => {
          const { subject } = parsed;
          if (subject) return [true];
          return [false, errorMessages['subject-empty']()];
        },
        'subject-full-stop': (parsed) => {
          const { subject } = parsed;
          if (!subject) return [true];
          const hasFullStop = subject.endsWith('.');
          return [!hasFullStop, errorMessages['subject-full-stop']()];
        },
        'type-case': (parsed) => {
          const { type } = parsed;
          if (!type) return [true];
          const isLowerCase = type === type.toLowerCase();
          return [isLowerCase, errorMessages['type-case']()];
        },
        'header-max-length': (parsed) => {
          const { header } = parsed;
          if (!header) return [true];
          const isValid = header.length <= 72;
          return [isValid, errorMessages['header-max-length']()];
        },
      },
    },
  ],
};

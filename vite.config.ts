import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import AutoImport from 'unplugin-auto-import/vite';
import { WeappTailwindcss } from 'weapp-tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = __dirname;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // @ts-expect-error uni 使用 CommonJS 导出，在 ESM 中需通过 .default 访问
    uni.default(),
    WeappTailwindcss({
      cssEntries: [resolve(projectRoot, 'src/app.css')],
      cssOptions: {
        rem2rpx: true,
      },
    }),
    AutoImport({
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/, // .vue
      ],
      imports: ['vue', 'uni-app'],
      dts: 'src/auto-imports.d.ts',
      // 生成 ESLint 规则，避免自动导入的变量报错
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
      },
    }),
    // 注意：不使用 unplugin-vue-components
    // uni-app 使用 easycom 机制自动注册组件（components/组件名/组件名.vue）
    // 类型声明由 src/components.d.ts 手动维护
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    // 生产环境移除 console 和 debugger
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});

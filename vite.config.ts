import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { WeappTailwindcss } from 'weapp-tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = __dirname;

// https://vitejs.dev/config/
export default defineConfig({
  // server: {
  //   host: "0.0.0.0",
  //   port: 8080,
  //   open: true,
  //   proxy: {
  //     "/api": {
  //       target: "http://localhost:3000",
  //       changeOrigin: true,
  //       rewrite: (path) => path.replace(/^\/api/, ""),
  //     },
  //   },
  // },
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
    Components({
      // 指定组件所在位置，默认为 src/components
      dirs: ['src/components'],
      // 遍历子目录
      deep: true,
      // 生成 components.d.ts，统一放在 typings 目录
      dts: 'typings/components.d.ts',
    }),
  ],
  optimizeDeps: {
    // 预构建时需要额外加速的依赖
    // include: [],
    // 预构建时不需要加速的依赖
    // exclude: [],
  },
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
    // sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        },
      },
    },
  },
});

/**
 * uqrcodejs 类型声明
 *
 * uqrcodejs 为 UMD 格式 CommonJS 模块，无官方 .d.ts
 * 此处声明 useQrcodeMaker.ts 所需的类型
 */

declare module 'uqrcodejs' {
  interface UQRCodeConstructor {
    new (): import('./types').UQRCodeInstance;
    errorCorrectLevel: {
      L: string;
      M: string;
      Q: string;
      H: string;
    };
    plugins: unknown[];
    use: (plugin: unknown) => void;
  }

  // eslint-disable-next-line import-x/no-default-export
  const UQRCode: UQRCodeConstructor;
  export default UQRCode;
  export type { UQRCodeConstructor };
}
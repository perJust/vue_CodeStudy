/**
 * rollup更加轻小，主要针对js库的进行打包
 * 
 * 注意点(坑点)：rollup2.0+需要node版本为10+   这是rollup官方回答pull request  rollup2.0+版本后不再支持node的8版本
 */
import babel from "rollup-plugin-babel";
import serve from "rollup-plugin-serve";

export default {
    input: "./src/index.js",
    output: {
        file: "dist/umd/mVue.js",
        name: "mVue",   // 指定打包后的全局变量
        format: "umd",  // 统一模块规范
        sourceMap: true,    // 开启源码调试
    },
    plugins: [   // 插件
        babel({
            exclude: "node_modules/**",
            runtimeHelpers: true // 配置runtime
        }),
        process.env.ENV === "development"?serve({
            open: true,
            openPage: "/public/index.html",
            port: 3000,
            contentBase: "",    // 静态路径
        }):null
    ]
}
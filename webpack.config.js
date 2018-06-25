"use strict";

const path = require("path");

module.exports = {
    entry: "./src/client.ts",
    output: {
        filename: "add-in-client.js",
        path: path.resolve(__dirname, "dist"),
        library: "MindLinkAddInClient",
        libraryTarget: "umd",
        libraryExport: "default",
        umdNamedDefine: true
    },
    resolve: {
        extensions: [".ts"]
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [{
                    loader: "ts-loader"
                }],
                exclude: /node_modules/
            }
        ]
    }
}

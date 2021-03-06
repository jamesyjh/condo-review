const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const Dotenv = require("dotenv-webpack");

const webpack = require("webpack");

let mode = "development";
let target = "web";

const PROD_ENV_PATH = "./.env";
const DEV_ENV_PATH = "./.env.dev";

const plugins = [
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
        template: "src/index.html",
        // favicon: "src/assets/favicon.ico",
    }),
    new CleanWebpackPlugin(),
    // new CopyPlugin({
    //     patterns: [{ from: "src/robots.txt", to: "robots.txt" }],
    // }),
];

switch (process.env.NODE_ENV) {
    case "staging":
        mode = "production";
        target = "browserslist";

        plugins.push(
            new CopyPlugin({
                patterns: [{ from: "src/config/config.stage.js", to: "config.js" }],
            })
        );

        break;

    case "production":
        mode = "production";
        target = "browserslist";

        plugins.push(
            new CopyPlugin({
                patterns: [{ from: "src/config/config.prod.js", to: "config.js" }],
            })
        );
        break;

    case "test":
        plugins.push(
            new CopyPlugin({
                patterns: [{ from: "src/config/config.test.js", to: "config.js" }],
            })
        );
        break;

    default:
        plugins.push(
            new ReactRefreshWebpackPlugin(),
            new webpack.HotModuleReplacementPlugin(),
            new CopyPlugin({
                patterns: [{ from: "src/config/config.dev.js", to: "config.js" }],
            })
        );

        break;
}
console.log(`Running in ${process.env.NODE_ENV} environment`);

module.exports = () => {
    return {
        entry: "./src/index.js",
        mode: mode,
        target: target,
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "index.bundle.js",
            assetModuleFilename: "images/[hash][ext][query]",
            publicPath: "/",
        },
        devtool: "source-map",

        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                    },
                },
                {
                    test: /\.tsx?$/,
                    use: "ts-loader",
                    include: __dirname,
                },
                {
                    test: /\.(s[ac]|c)ss$/i,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: { publicPath: "" },
                        },
                        "css-loader",
                    ],
                },
                {
                    test: /\.(png|jpe?g|gif|svg)$/i,
                    type: "asset",
                },
                {
                    test: /\.(eot|gif|otf|ttf|woff)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    use: ["file-loader"],
                },
            ],
        },
        plugins: [
            new Dotenv({
                path: process.env.NODE_ENV === "production" ? PROD_ENV_PATH : DEV_ENV_PATH,
            }),
            ...plugins,
        ],
        devServer: {
            hot: true,
            open: true,
            overlay: true,
            writeToDisk: true,
            port: 3000,
            host: "0.0.0.0",
            public: "localhost:3000",
            disableHostCheck: true,
            historyApiFallback: true,
        },
    };
};

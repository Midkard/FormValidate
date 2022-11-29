
module.exports = {
    output: {
        filename: 'validate.min.js'
    },
    externals: {
        jquery: 'jQuery'
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            url: false,
                        },
                    }
                ],
            },
        ],
    },
    mode: 'production'
};
const rules = require('./webpack.rules')

const rendererRules = rules.filter((rule) => {
    // Filter out rules that use @vercel/webpack-asset-relocator-loader or node-loader
    if (rule.use && typeof rule.use === 'object' && rule.use.loader) {
        return (
            !rule.use.loader.includes('@vercel/webpack-asset-relocator-loader') &&
            !rule.use.loader.includes('node-loader')
        )
    }
    if (rule.use === 'node-loader') {
        return false
    }
    return true
})

rendererRules.push({
    test: /\.css$/,
    use: [
        { loader: 'style-loader' },
        { loader: 'css-loader' },
        {
            loader: 'postcss-loader',
            options: {
                postcssOptions: {
                    plugins: [require('tailwindcss'), require('autoprefixer')],
                },
            },
        },
    ],
})

module.exports = {
    // Put your normal webpack config below here
    module: {
        rules: rendererRules,
    },
    cache: {
        type: 'filesystem',
    },
    externals: 'node-pty',
    node: {
        __dirname: true,
    },
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx'],
    },
}


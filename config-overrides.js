module.exports = function override (config, env) {
    console.log('override')
    let loaders = config.resolve
    loaders.fallback = {
        "stream": require.resolve("stream-browserify"),
    }
    
    return config
}

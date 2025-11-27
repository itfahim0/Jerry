module.exports = {
    apps: [{
        name: "jerry-bot",
        script: "./src/index.js",
        watch: false,
        env: {
            NODE_ENV: "production",
        }
    }]
};

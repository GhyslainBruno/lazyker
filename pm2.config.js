module.exports = {
    apps : [
        {
            name: "lazyker",
            script: "./backend/server.js",
            watch: true,
            env: {
                "NODE_ENV": "production",
            }
        }
    ]
};
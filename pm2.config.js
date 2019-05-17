module.exports = {
    apps : [
        {
            name: "lazyker",
            script: "./backend/server.js",
            watch: true,
            ignore_watch : ["backend/scrappers/ygg"],
            env: {
                "NODE_ENV": "production",
            }
        }
    ]
};
module.exports = {
    apps : [
        {
            name: "lazyker",
            script: "./backend/server.js",
            watch: true,
            ignore_watch : ["backend/scrappers/ygg/torrent_temp"],
            env: {
                "NODE_ENV": "production",
            }
        }
    ]
};
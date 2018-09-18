module.exports = {
    apps : [
        {
            name: "lazyker",
            script: "./backend/server.js",
            watch: false,
            error_file: "stderr.txt",
            env: {
                "NODE_ENV": "production",
            }
        }
    ]
};
module.exports = {
    apps : [
        {
            name: "lazyker",
            script: "./serveur.js",
            watch: false,
            error_file: "stderr.txt",
            env: {
                "NODE_ENV": "production",
            }
        }
    ]
}
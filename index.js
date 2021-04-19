const fs = require("fs");
const http = require("http");
const querystring = require("querystring");
const path = require("path");

const hostname = "localhost";
const port = 2000;

let config;

let songDir;
let songs = [];

let currentSong = "";

function trimExtension(file) {
    if (file == undefined || file == null) return "";
    return file.split('.').slice(0, -1).join('.');
}

function generateCSS() {
    let out = "color: ";

    switch (config.songColor) {
        case 0:
            out += "black";
            break;
        case 1: 
            out += "white";
            break;
        case 2:
            out += "#FFF456";
            break;
        case 3:
            out += "#FFB420";
            break;
        case 4:
            out += "#FF473D";
            break;
        case 5:
            out += "#C55DF9";
            break;
        case 6:
            out += "#1373DB";
            break;
        case 7:
            out += "#61CEFF";
            break;
        case 8:
            out += "#5EFF86";
            break;
        case 9:
            out += "#C4C4C4";
            break;
    }

    out += ";\ntext-align: ";

    switch (config.songAlign) {
        case 0:
            out += "left";
            break;
        case 1:
            out += "center";
            break;
        case 2:
            out += "right";
            break;
    }

    return out;
}

function getReloadTime() {
    switch (config.songRefresh) {
        case 0: return 0.5;
        case 1: return   1;
        case 2: return   5;
        case 3: return  10;
       default: return   1;
    }
}

function getRandomSong(current) {
    if (current == null) current = "";
    if (songs.length < 2) return "";
    
    let rng = 0;
    let interations = 5;
    do {
        rng = Math.floor(Math.random() * songs.length);
        interations--;
    } while (songs[rng] == current || interations <= 0);

    return songs[rng];
}

const server = http.createServer((request, result) => {
    const url = querystring.unescape(request.url);
    
    let filePath = path.resolve("./www" + url + (url.endsWith("/") ? "index.html" : ""));
    const fileExtension = path.extname(filePath).substr(1);

    if (request.method === "POST") {
        let rawData = '';
        request.on('data', chunk => { rawData += chunk.toString(); });

        request.on('end', () => {
            const data = JSON.parse(rawData);

            if (data.current != null && data.current != undefined) currentSong = data.current;

            if (url.startsWith("/set")) {
                fs.writeFileSync("./config.json", rawData);
                
                reload();

                // for the love of god, only reload if the path actually changed!
                if (url.startsWith("/set/path")) reloadPath();

                result.statusCode = 200;
                result.end("");

                return;
            }

            if (url.startsWith("/fetch")) {

                if (url.startsWith("/fetch/songlist")) {

                    let escapedSongs = [];
                    songs.forEach(s => {
                        escapedSongs.push(querystring.escape(s));
                    });

                    result.statusCode = 200;
                    result.end(JSON.stringify({
                        songs: escapedSongs
                    }));

                    return;
                }

                result.statusCode = 200;
                result.end(JSON.stringify({
                    next: querystring.escape(getRandomSong(data.current)),
                    songDir: config.songDir,
                    songText: config.songText,
                    songRefresh: config.songRefresh,
                    songColor: config.songColor,
                    songAlign: config.songAlign,
                    volume: config.volume,
                    muted: config.muted
                }, null, 4));
                return;
            }

        });
        return;
    }

    if (url.startsWith("/songs/")) {
        let songPath = songDir + querystring.unescape(url.replace("/songs", ""));
        
        if (! fs.existsSync(songPath)) {
            result.statusCode = 404;
            result.setHeader("Content-Type", "text/html");
            result.end("Error 404: The requested song could not be found!");
            return;
        }
        if (fs.lstatSync(songPath).isDirectory()) {
            result.statusCode = 400;
            result.setHeader("Content-Type", "text/html");
            result.end("Error 400: The requested url points to a directory!");
            return;
        }

        result.statusCode = 200;
        result.setHeader("Content-Type", "audio/" + fileExtension);
        result.end(fs.readFileSync(songPath));
        return;
    }

    if (url.startsWith("/current")) {
        result.statusCode = 200;
        result.setHeader("Content-Type", "text/html");
        result.end(`
            <meta charset="UTF-8">
            <meta http-equiv='refresh' content='${getReloadTime()}'>
            <style>
                @import "/font/font.css";
                * {
                    font-size: xx-large;
                    ${generateCSS()}
                }
            </style>
            ${config.songText.replace("%0", trimExtension(currentSong))}
        
        `);
        return;
    }

    if (! fs.existsSync(filePath)) {
        result.statusCode = 404;
        result.setHeader("Content-Type", "text/html");
        result.end("Error 404: The requested file could not be found!");
        return;
    }

    result.statusCode = 200;
    switch (fileExtension) {
        case "svg":
            result.setHeader("Content-Type", "image/svg+xml");
            break;
        default:
            result.setHeader("Content-Type", "text/" + fileExtension);
    }

    // Send normal files without replacing anything
    result.end(fs.readFileSync(filePath));
});

function reload() {
    config = JSON.parse(fs.readFileSync("config.json"));
}

function reloadPath() {
    songs = [];

    songDir = config.songDir;
    if (! fs.existsSync(songDir)) {
        if (songDir == "") songDir = "./songs/"
        console.log(`Song Directory (${songDir}) does not exists! Creating...`);
        fs.mkdirSync(songDir);
    }

    fs.readdirSync(songDir).forEach(file => {
        if (file.match(/.*\.(wav)|(mp3)|(ogg)$/)) songs.push(file);
    });

    console.log("Songs loaded: " + songs.length);
}

server.listen(port, hostname, () => {
    console.log(`ControlPanel: http://${hostname}:${port}/`);
    console.log(`Currently Playing: http://${hostname}:${port}/current`);
    console.log();

    reload();
    reloadPath();
});
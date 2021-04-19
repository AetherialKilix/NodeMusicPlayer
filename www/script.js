// stores the current song file name e.g. "test.ogg"
let currentSong = "";
let nextSong = "";

document.addEventListener("DOMContentLoaded", () => {
    init();
    document.getElementById("songDir").addEventListener("change", () => {
        save();
    });
});


function reloadSongList() {
    fetch("/fetch/songlist", {
        method: "POST",
        body: "{}"
    }).then(response => response.json()).then(response => {
        let list = document.getElementById("autogen");
        list.innerHTML = "";

        for (let i = 0; i < response.songs.length; i++) {
            const song = response.songs[i];
            let link = document.createElement("a");
            link.onclick = () => { play(song); };
            link.innerText = unescape(trimExtension(song));
            list.appendChild(link);
        }

    });
}

function songURL(songname) {
    return "/songs/" + songname;
}

function savePath() {
    fetch("/set/path", {
        method: "POST",
        body: JSON.stringify({
            songDir: document.getElementById("songDir").value,
            songText: document.getElementById("songText").value,
            songRefresh: getRadio("refresh"),
            songColor: getRadio("color"),
            songAlign: getRadio("align"),
            volume: document.getElementById("song").volume,
            muted: document.getElementById("song").muted
        }, null, 4)
    }).then(response => { window.location.reload(); });
}

function save(callback) {
    if (callback == null) callback = () => {};

    fetch("/set", {
        method: "POST",
        body: JSON.stringify({
            songDir: document.getElementById("songDir").value,
            songText: document.getElementById("songText").value,
            songRefresh: getRadio("refresh"),
            songColor: getRadio("color"),
            songAlign: getRadio("align"),
            volume: document.getElementById("song").volume,
            muted: document.getElementById("song").muted
        }, null, 4)
    })
    .then(response => { callback(); });
}

function random() {
    let song = document.getElementById("song");
    if (song == null || song.undefined) {
        alert("The Audio player somehow went missing! Please go find it.");
        return;
    }

    song.pause();
    // load current song

    getValues(conf => {
        currentSong = unescape(conf.next);
        document.getElementById("songname").innerText = unescape(trimExtension(conf.next));
        song.setAttribute("src", "/songs/" + currentSong);
    });
    // load next song
    getValues(conf => {
        nextSong = unescape(conf.next);
        document.getElementById("nextSong").innerText = unescape(trimExtension(conf.next));
    });
    song.load();
    song.play();
}

function getValues(callback) {
    fetch("/fetch", {
        method: "POST",
        body: JSON.stringify({
            // sends the current settings to the server
            current: currentSong
        })
    })
    .then(response => response.json())
    .then(data => callback(data));
}

function play(songfile) {
    let song = document.getElementById("song");
    if (song == null) {
        alert("The Audio player somehow went missing! Please go find it.");
        return;
    }

    currentSong = songfile;
    song.pause();
    song.setAttribute("src", "/songs/" + songfile);
    document.getElementById("songname").innerText = unescape(trimExtension(currentSong));
    song.play();

    // load next song
    getValues(conf => {
        nextSong = unescape(conf.next)
        document.getElementById("nextSong").innerText = unescape(trimExtension(conf.next));
    });
}

function next() {
    save(() => {
        // saving is done, now load the next song,
        // this makes sure, that the values are actually applied
        rotateSong();
    });
}

function rotateSong() {
    let song = document.getElementById("song");
    if (song == null || song.undefined) {
        alert("The Audio player somehow went missing! Please go find it.");
        return;
    }
    // stop audio playback
    song.pause();

    // set current song
    currentSong = nextSong;
    song.setAttribute("src", "/songs/" + currentSong);
    document.getElementById("songname").innerText = unescape(trimExtension(currentSong));
    // next song
    getValues(conf => {
        nextSong = unescape(conf.next)
        document.getElementById("nextSong").innerText = unescape(trimExtension(conf.next));
    });

    // load and start the song
    song.load();
    song.play();
}

function init() {
    // load first song
    getValues(conf => {
        // set the radio buttons
        setRadio("refresh", conf.songRefresh);
        setRadio("color",   conf.songColor);
        setRadio("align",   conf.songAlign);
        
        document.getElementById("song").volume = conf.volume;
        document.getElementById("song").muted = conf.muted;

        document.getElementById("songDir").value = conf.songDir;
        document.getElementById("songText").value = conf.songText;
    });
    random();
    reloadSongList();
}

function trimExtension(file) {
    if (file == undefined || file == null) return "";
    return file.split('.').slice(0, -1).join('.');
}

function getRadio(name) {
    let all = document.getElementsByName(name);
    if (all == null || all.length < 1) return -2;
    for (let i = 0; i < all.length; i++) {
        if (all[i].checked) return i;
    }
    return -1;
}

function setRadio(name, index) {
    document.getElementsByName(name)[index].checked = true;
}
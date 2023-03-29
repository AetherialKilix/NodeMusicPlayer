# NodeMusicPlayer
A simple Music Player using node. (Meant for OBS, but usable with most webbrowsers)

## Hello
Hello, I'm (Aetherial)Kilix.

I made this Music player for a friend, which means it might be a tiny bit janky...
Many Thanks to Aehter, for the UI design.

## Why is it not working?
Well I honestly don't know... the launching files were made with a npm plugin, that I did not read into at all.
You might need to install node.js to be able to run them.
If it runs, and just broke somehow, try replacing the content of the config.json file with this (these are the default values):
```
{
    "songDir": "./songs/",
    "songText": "Current Song: %0",
    "songRefresh": 0,
    "songColor": 0,
    "songAlign": 0,
    "volume": 1,
    "muted": false
}
```
## How to run it
Just use the executables... ¯\\_(ツ)_/¯
There should be a commandline-ish window popping up.

## How to use if when it's running
To open the control panel, visit http://localhost:2000 in a webbrowser.
This application was designed to be used with OBS, as a docked window, for a quick tutorial on how to do that, look at the next "header".
To open the "Currently Playing" text, visit http://localhost:2000/current

## How to 'install' it inside OSB

Make sure to be able to read this 'chapter' while executing the steps

1. Locate the toolbar (if you have no idea what that is, it's the bar with buttons like "file" "view" "help" right at the top of most applications)
2. Click on "View" (or your language-equivalent)
3. Hover over "Docs"
4. Click on "Custom Browser Docs..."
   - There should now be a table. If there is anything written in there, you already got some docs, and should know how to add them ;)
5. The last row should be empty
   - The left side defines the name for the doc. i would recommend a name like "Music Player" or "Node Music Player" but you can use "ludhfslh" if you want.
   - The right side defined where the doc should take it's contents from. here put "http://localhost:2000"
6. Click on Apply

## Legal 
Feel free to do whatever you want with it.
If you feel the need to modify/improve it and then charge money for that... i don't care.
But a shoutout if you use/redistribute it would be greatly appreciated!

## LICENSE:
DO WHAT THE FUCK YOU WANT:
<a href="http://www.wtfpl.net/"><img src="http://www.wtfpl.net/wp-content/uploads/2012/12/wtfpl-badge-4.png" width="80" height="15" alt="WTFPL" /></a>

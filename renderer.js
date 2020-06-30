// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const { webFrame } = require('electron');

// 获取当前应用缩放比例（Linux/Mac OS不能用）
//let scaleFactor = require('electron').screen.getPrimaryDisplay().scaleFactor;

// 设置同步缩放比例
//webFrame.setZoomFactor(scaleFactor);
webFrame.setZoomFactor(1);// 实际1.25

let ipcRenderer = require('electron').ipcRenderer;

//var max = document.getElementById("max");

window.$ = window.jQuery = require('./js/jquery-3.4.1.min.js');

ipcRenderer.on('main-window-max', (event) => 
{
    $("#max").attr("src", "./images/maxed.png");
});

ipcRenderer.on('main-window-unmax', (event) => 
{
    $("#max").attr("src", "./images/max.png");
});

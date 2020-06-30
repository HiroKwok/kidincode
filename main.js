// Modules to control application life and create native browser window
const app = require('electron').app;
const BrowserWindow = require('electron').BrowserWindow;
const path = require('path');
const electron = require('electron');
const remote = require('electron').remote;
const dialog = electron.dialog;
const globalShortcut = electron.globalShortcut;

// 获取electron窗体的菜单栏
const Menu = electron.Menu;
const MenuItem = electron.MenuItem;

// 打印启动参数
/*
console.log("info: " + process.argv);
console.log("info: " + process.argv[0]);
console.log("info: " + process.argv[1]);
console.log("info: " + process.argv[2]);
console.log("info: " + process.argv[3]);
*/

// 获取启动参数
global.sharedObject = {prop1: process.argv};

// 隐藏electron创建的菜单栏
//Menu.setApplicationMenu(null);

// 绑定快捷键（当前窗口获得焦点时激活）
const menu = new Menu();

menu.append(new MenuItem(
{
    label: 'Save',
    accelerator: 'CommandOrControl+S',
    click: () => 
    { 
        mainWindow.webContents.send('save', 'true');
    }
}));

Menu.setApplicationMenu(menu);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow ()
{
    readConfig();

    // Create the browser window.
    mainWindow = new BrowserWindow(
    {
        width: preWidth,
        height: preHeight,
        //show: false,
        backgroundColor: "#333333",
        //titleBarStyle: 'hidden',
        //transparent: true, 
        frame: false,
        //fullscreenable: false,
        center:true,            // 显示位置在屏幕中央
        webPreferences: 
        {
            // webPreferences的值，如果写preload会影响后面最大最小化功能不起作用。
            //preload: path.join(__dirname, 'preload.js')
            nodeIntegration: true,
            webviewTag:true,
            zoomFactor: 1
            //nodeIntegrationInWorker: true
        },
        //fullscreenWindowTitle: true,
        //fullscreen:true,
        //fullscreenable: true,
        //resizable: true
        /*
        width: parseInt(displayWorkAreaSize.width * 0.85, 10),
        height: parseInt(displayWorkAreaSize.height * 0.85, 10),
        center: true,
        resizable: true,
        movable: true,
        fullscreenable: false,
        enableLargerThanScreen: false,
        frame: false,
        transparent: true,
        alwaysOnTop: false,
        clickThrough: 'pointer-events',
        acceptFirstMouse: true,
        hasShadow: false,
        minWidth: 1000,
        minHeight: 648,
        webPreferences: {
            devTools: true,
            webSecurity: false,
            plugins: true,
            experimentalFeatures: true,
            experimentalCanvasFeatures: true,
            minimumFontSize: 10,
        },
        */
    })

    // 绑定全局快捷键
    /*
    globalShortcut.register('CommandOrControl+K', function () 
    {

    });
    */

    // and load the index.html of the app.
    //mainWindow.loadFile('index.html');
    mainWindow.loadFile('index.html');

    //mainWindow.setSize(1280, 720);
    mainWindow.setMinimumSize(1024, 600);
    //mainWindow.webContents.setZoomFactor(2);

    // Open the DevTools.
    //mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () 
    {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    })

    mainWindow.on('maximize', function () 
    {
        mainWindow.webContents.send('main-window-max');
    })
  
    mainWindow.on('unmaximize', function () 
    {
        mainWindow.webContents.send('main-window-unmax');
    })

    mainWindow.on('resize', function () 
    {
        //var w = mainWindow.getSize()[0];
        //var h = mainWindow.getSize()[1];
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () 
{
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit();
})

app.on('activate', function () 
{
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow();
})

app.on('will-quit', function () 
{
    // 解除全局快捷键绑定
    // globalShortcut.unregisterAll();
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

let ipcMain = require('electron').ipcMain;

// 接收最小化命令
ipcMain.on('window-min', function() 
{
    mainWindow.minimize();
})

// 接收最大化命令
ipcMain.on('window-max', function() 
{
    if (mainWindow.isMaximized()) 
    {
        mainWindow.restore();
    } 
    else 
    {
        mainWindow.maximize();
    }
})

// 接收关闭命令
ipcMain.on('window-close', function() 
{
    // 关闭串口服务器
    killProcs();

    mainWindow.close();
    app.quit();
})

// 接收调试信息
ipcMain.on('debug', function(event, arg) 
{
    console.log(arg);
})

// 终止进程
function killProcs()
{
    childProcess = require('child_process');

    // 判断当前系统类型
    const os = require('os');
    var sys = os.platform();

    let cmd = "";

    if(sys == 'win32')
    {
        cmd = "taskkill /f /im webSerialTool.exe";
    }
    else if(sys == 'linux' || sys == 'freebsd')
    {
        cmd = "";
    }
    else if(sys == 'darwin')
    {
        cmd = "";
    }

    // 关闭服务器
    childProcess.exec(cmd);
}

// 终止进程
ipcMain.on('killProc', function(event, arg) 
{
    //console.log(arg);
    //process.kill(arg);
    console.log('kill pid :' + arg);
    
    try 
    {
        childProcess = require('child_process');
        iconv = require('iconv-lite');
        encoding = 'cp936';
        binaryEncoding = 'binary';
        if(process.platform === 'win32')
        {
            cc = childProcess.exec('taskkill /pid ' + arg + ' -t -f');

            cc.stdout.on('data', function (data) 
            {
                data = iconv.decode(new Buffer(data, binaryEncoding), encoding);
                console.log(data);
            });

            cc.stderr.on('data', function (data) 
            {
                data = iconv.decode(new Buffer(data, binaryEncoding), encoding);
                console.log(data);
            });
        }
        else
        {
            process.kill(arg);
        }
    }
    catch(err)
    {
        console.log('err :' + err);
    }
})

var isFull = false;
var isRecSize = false;
var preWidth  = 1188;
var preHeight = 766;

// 读取配置文件
function readConfig()
{
    var jsonFile = require('jsonfile');
    var fileName = './config.json';

    let fs = require("fs");

    if(fs.existsSync(fileName))
    {
        var jsonData = jsonFile.readFileSync(fileName);

        isFull = jsonData.fullScreen;
        isRecSize = jsonData.recSize;

        // 如果使用上一次窗口尺寸
        if(isFull == "true")
        {
            //let size = electron.screen.getPrimaryDisplay().workAreaSize;

            //preWidth =  size.width
            //preHeight =  size.height;

            // 窗口最大化
        }
        else if(isRecSize == "true")
        {
            preWidth =  Number(jsonData.width);
            preHeight =  Number(jsonData.height);
        }
    }
}
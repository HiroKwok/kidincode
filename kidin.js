$(document).ready(function () 
{
    kidin.init();
});

var kidin = 
{
    os          : String(),
    rootDir     : String(),     // 应用根目录
    jsDir       : String(),     // js文件目录
    isPublished : Boolean(),    // 是否为发布版

    // 初始化
    init : function()
    {
        // 获取系统类型
        kidin.getOS();

        // 获取发布状态
        kidin.getPublished();

        // 初始化界面
        gui.init();

        // 初始化通讯服务器
        comm.init();
    },

    getOS : function()
    {
        // 判断当前系统类型
        const os = require('os');

        // win32 / linux / freebsd / darwin
        this.os = os.platform();
    },

    getPublished : function()
    {
        if(this.os == 'win32')
        {
            const path = require('path');
            const fs = require('fs');

            // 发布版主程序根目录
            let exeRoot = path.resolve(__dirname, '../../');

            // 判断当前是否为发布版本
            let root = exeRoot + "/kidin.exe";

            // 如果是发布版
            if (fs.existsSync(root))
            {
                this.isPublished = true;
                this.rootDir = exeRoot;

                debug.log("info: version is published.");
            }
            else
            {
                this.isPublished = false;

                this.rootDir = __dirname;

                debug.log("info: version is not published.");
            }
        }
        else if(this.os == 'linux' || this.os == 'freebsd')
        {
            this.isPublished = false;
        }
        else if(this.os == 'darwin')
        {
            this.isPublished = false;
        }
    },

    unifyPath : function(path)
    {
        // 判断当前系统类型
        let prjName = "";

        // 统一路径符号
        if(kidin.os == 'win32')
        {
            // 从路径中提取文件名称作为项目名
            prjName = path.replace(/\//g,'\\');

            let index = prjName.split("\\").length - 1;

            prjName = prjName.split("\\")[index];

            let index2 = prjName.indexOf('.');

            prjName = prjName.substring(0, index2);
        }
        else
        {
            prjName = path.replace(/\\/g,"\/");

            let index = prjName.split("/").length - 1;

            prjName = prjName.split("/")[index];

            let index2 = prjName.indexOf('.');

            prjName = prjName.substring(0, index2);
        }

        return prjName;
    }
}

var debug = 
{
    log: function (msg) 
    {
        // Hello World
        ipcRenderer.send('debug', msg);
    }
}

function launchPrj() 
{    
    //var myDate = new Date();
    //debug.log(myDate.toLocaleString('cn',{hour12:false}));

    // 更新标题栏颜色
    $("#titleBar").css("background-color", "#3C3C3C");
    gui.titleBar.btnMin.show();
    gui.titleBar.btnMax.show();

    // 关闭加载动画
    $("#aniLoading").hide();

    // 关闭加载页面
    $("#splash").fadeOut("slow");
    $("#main").fadeIn("slow");
    gui.titleBar.iconArea.fadeIn("slow");

    // 更新标题
    //gui.titleBar.titleTxt.text("请新建或打开一个项目 - KIDIN CODE");

    var remote = require('electron').remote,
        arguments = remote.getGlobal('sharedObject').prop1;
 
    // 获取启动参数
    //let argMode = arguments[2];
    //let argType = arguments[3];
    //alert(arguments[0]);

    let argMode = project.mode;
    let argType = project.type;
    let argPath = project.path;

    // 获取文件路径（双击打开文件）
        
    // 如果有指定参数
    if(argMode != "none" && argMode != "")
    {
        // 获取项目模式
        if(argMode.indexOf("CODE") > 0)
        {
            argMode = "CODE";
        }
        else if(argMode.indexOf("BLOCK") > 0)
        {
            argMode = "BLOCK";
        }

        // 获取项目类型
        if(argType.indexOf("ARDUINO")  > 0)
        {
            argType = "ARDUINO";
        }
        else if(argType.indexOf("MICRO_BIT")  > 0)
        {
            argType = "MICRO_BIT";
        }
        else if(argType.indexOf("MICRO_PYTHON")  > 0)
        {
            argType = "MICRO_PYTHON";
        }

        if(argPath == "")
        {
            // 创建新项目
            project.createPrj("未命名", argMode, argType);
        }
        else
        {
            // 打开项目
            project.openPrjSync(argPath);
        }
    }
}

var isNewPrj    = true;
var loadCounter = 0;
var loadSum     = 4;    // 核心项加载完毕后启动

// 代码编辑器加载完毕
function editorLoadComplete() 
{
    loadCounter++;

    if(loadCounter == loadSum)
    {
        // 启动项目
        launchPrj();
    }

    debug.log("info: editor load complete.");

    // 监听光标变化状态
    codeEditor.window.editor.onDidChangeCursorPosition((e) => {
        updateEditorMsg();
    });

    // 如果代码内容改变更改保存状态
    //project.isSave == false;
}

// 控制台加载完毕
function consolLoadComplete() 
{
    loadCounter++;

    debug.log("info: console load complete.");

    if(loadCounter == loadSum)
    {
        // 启动项目
        launchPrj();
    }
}

// 积木版块加载完毕
function blockLoadComplete() 
{
    loadCounter++;

    debug.log("info: blocks load complete.");

    $("#blockLoadAni").hide();
    gui.blocksEditor.show();

    // 加载代码
    if(project.xml != "")
    {
        blockEditor.window.setXmlToBlock(project.xml);
    }
    
    if(loadCounter == loadSum)
    {
        // 启动项目
        launchPrj();
    }
}

// 串口通讯模块加载完毕
function commLoadComplete() 
{
    loadCounter++;

    debug.log("info: comm load complete.");

    if(loadCounter == loadSum)
    {
        // 启动项目
        launchPrj();
    }
}

// 获取开发模式
function getPrjMode()
{
    let prjMode = "";

    if(gui.startPage.btnModeCode.isSelected == true)
    {
        prjMode = "CODE";
    }
    else
    {
        prjMode = "BLOCK";
    }

    return prjMode;
}

// 获取项目类型
function getPrjType()
{
    let prjType = "";

    if(gui.startPage.btnTypeArduino.isSelected == true)
    {
        prjType = "ARDUINO";
    }
    else if(gui.startPage.btnTypeMicrobit.isSelected == true)
    {
        prjType = "MICRO_BIT";
    }
    else if(gui.startPage.btnTypeMicroPython.isSelected == true)
    {
        prjType = "MICRO_PYTHON";
    }

    return prjType;
}

$("#btnCreatePrj").click(function () 
{
    createNewPrj();
});

function createNewPrj()
{
    // 如果资源未完成加载则返回
    if(loadCounter < loadSum)
    {
        return;
    }

    config.mode = project.getPrjMode();
    config.type = project.getPrjType();
    
    // 在新建窗口创建项目
    if(project.name != "")
    {
        // 创建临时文件写入项目信息
        config.writeTmp();

        // 创建新项目窗口
        project.createNewPrj();
    }
    else
    {
        // 创建新项目
        project.createPrj("未命名", getPrjMode(), getPrjType());
    }
}

// 更新状态栏编辑器状态信息
function updateEditorMsg() 
{
    var line = codeEditor.window.editor.getPosition().lineNumber;
    var column = codeEditor.window.editor.getPosition().column;

    $("#footer-line").text(line);
    $("#footer-column").text(column);
}

// 鼠标点击打开按钮
$('#fileOpen').click(function () 
{
    project.openPrjSync();
});

// 鼠标点击保存按钮
$('#fileSave').click(function () 
{
    project.savePrjSync();
});

// 鼠标点击另存为按钮
$('#fileSaveAs').click(function () 
{
    project.savePrjSync(true);
});

// 编译
$("#btnCompile").click(function () 
{
    // 清空控制台信息
    //consoleEditor.window.clear();
    output.clear();

    // 设置控制台可编辑
    consoleEditor.window.setEditable(true);

    // 只编译
    //dump(false);
    arduino.dump(false);
});

// 上传
$("#btnUpload").click(function () 
{
    // 更新串口设备列表
    device.getComDev();

    setTimeout(function ()
    {
        // 先判断是否已经接入设备
        if(arduino.com == "disconnected")
        {
            // 弹出提示
            gui.showTips("请先连接主控板！", 1.5);
            
            return;
        }

        // 清空控制台信息
        //consoleEditor.window.clear();
        output.clear();

        // 设置控制台可编辑
        consoleEditor.window.setEditable(true);

        // 编译并上传
        //dump(true);
        arduino.dump(true); 
                
    }, 500);
});

// 清除
$("#btnClear").click(function () 
{
    // 清除控制台信息
    //clear();
    output.clear();
});

// 停止
$("#btnStop").click(function () 
{
    childProcess = require('child_process');

    for(let i = 0; i < 5; i++)
    {
        try
        {
            if (typeof(dumpProc.pid) != "undefined")
            {
                //ipcRenderer.send('killProc', dumpProc.pid);
                childProcess.exec('taskkill /pid ' + dumpProc.pid + ' -t -f');
            }
        }
        catch(err){}

        try
        {
            if (typeof(compileProc.pid) != "undefined")
            {
                //ipcRenderer.send('killProc', compileProc.pid);
                childProcess.exec('taskkill /pid ' + compileProc.pid + ' -t -f');
            }     
        }
        catch(err){}
        
        try
        {
            if (typeof(uploadProc.pid) != "undefined")
            {
                //ipcRenderer.send('killProc', compileProc.pid);
                childProcess.exec('taskkill /pid ' + uploadProc.pid + ' -t -f');
            }     
        }
        catch(err){} 
    }
});

// 更新
$("#btnUpdate").click(function () 
{
    // 更新串口设备列表
    device.getComDev();

    // 隐藏下拉菜单
    $("#dropdown-com").hide();

    setTimeout( function()
    {
        // 先判断是否已经接入设备
        if(arduino.com == "disconnected")
        {
            // 弹出提示
            gui.showTips("请先连接主控板！", 1);
        }
        else
        {
            // 弹出提示
            gui.showTips("串口已更新！", 1);
        }
    }, 500 );
});

// 保存项目
ipcRenderer.on('save', (event, message) => 
{
    //alert(message);

    // 如果当前标签为代码或积木
    if($("#contentCode").is(":visible") || $("#contentBlock").is(":visible"))
    {
        project.savePrjSync();
    }
})
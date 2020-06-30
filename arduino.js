/*
var boardModel  = new Object(); // 当前选中的版型
var boards      = new Array();  // 版型信息列表
var devices     = new Array();  // 调试设备列表
var com         = "";           // 当前选中的串口
*/

var dumpProc    = new Object();
var compileProc = new Object();
var uploadProc  = new Object();

var arduino = 
{
    boardModel: Object(),
    boards: Array(),
    devices: Array(),
    com: String,

    getBoards: function()
    {
        var fs = require("fs");
        var filelist = fs.readdirSync('./hardware/windows/arduino/boards/');
    
        $("#dropdown-board").empty();
    
        this.boards = new Array();
    
        for (var i = 0; i < filelist.length; i++) 
        {
            var jsonFile = require('jsonfile');
            //var fileName = './hardware/windows/arduino/boards/boards_higgs_block.json'
            var fileName = './hardware/windows/arduino/boards/' + filelist[i];
    
            var jsonData = jsonFile.readFileSync(fileName);
    
            var board = new Object();
    
            board.name      = jsonData.board;
            board.reset     = jsonData.reset;
            board.dump      = jsonData.dump;
            board.compile   = jsonData.compile;
            board.upload    = jsonData.upload;
    
            this.boards.push(board);
    
            var item = $("<li id = '"+i+"'><a href='#'>" + board.name + "</a></li>");
    
            $("#dropdown-board").append(item);
    
            item.click(function ()
            {
                // 选定主控板型号
                arduino.boardModel = arduino.boards[$(this).attr("id")];

                config.board = $(this).text();

                // 更新下拉按钮文本
                $("#listBoard").text($(this).text());
    
                // 隐藏下拉菜单
                $("#dropdown-board").hide();
            });
    
            /*
            for (var j = 0; j < jsonData.paras.length; j++) 
            {
                //alert("name: " + jsonData.paras[j].name);
                //alert("name: " + jsonData.paras[j].value);
            }
            */
        }

        // 默认从配置文件中寻找上一次选中的版型
        if(config.board != "")
        {
            for(let i = 0; i < this.boards.length; i++)
            {
                if(config.board == this.boards[i].name)
                {
                    this.boardModel = this.boards[i]

                    break;
                }
            }
        }
        else
        {
            // 默认选中主控板
            this.boardModel = this.boards[0];
        }
    
        // 显示选中的主控板
        $("#listBoard").text(this.boardModel.name);
    
        // 函数只调用一次
        readBoards = function () {};
    },
    
    dump: function(next)
    {
        // 屏蔽按钮
        btnsEnable(false);

        const exec = require('child_process').exec;
        const iconv = require('iconv-lite');
        const encoding = 'cp936';
        const binaryEncoding = 'binary';

        // 任何你期望执行的cmd命令，ls都可以
        //let cmdStr = './你的可执行程序名称 -p 需要输入密码的话'
        // 执行cmd命令的目录，如果使用cd xx && 上面的命令，这种将会无法正常退出子进程
        //let cmdPath = '执行cmd命令的路径' 
        // 子进程名称
        //let cmdStr = 'dir';

        const {
            remote
        } = require('electron');

        let tmpPath = remote.app.getPath('userData');

        var rootPath    = __dirname;
        var cachePath   = tmpPath + "/Cache";
        var builtPath   = tmpPath + "/Built";
        var codePath    = tmpPath + "/Code";

        // 判断当前系统类型
        if(kidin.os == 'win32')
        {
            // 如果是发布版
            if(kidin.isPublished == true)
            {
                rootPath = kidin.rootDir;
            }

            rootPath += "/hardware/windows/arduino";
        }
        else if(kidin.os == 'linux' || kidin.os == 'freebsd')
        {
            rootPath += "/hardware/linux/arduino";
        }
        else if(kidin.os == 'darwin')
        {
            rootPath += "/hardware/mac/arduino";
        }

        const fs = require('fs');

        // 更新缓存目录
        if (fs.existsSync(cachePath)) {
            //fs.rmdir(cachePath, function(){});
        } else {
            fs.mkdir(cachePath, function () {});
        }

        // 更新构建目录
        if (fs.existsSync(builtPath)) {
            //fs.rmdir(builtPath, function(){});
        } else {
            fs.mkdir(builtPath, function () {});
        }

        // 更新源码目录
        if (fs.existsSync(codePath)) 
        {
            saveCode();
        } 
        else 
        {
            saveCode();
        }

        function saveCode()
        {
            fs.mkdir(codePath, function () 
            {
                // 保存源码临时文件
                //var code = blockEditor.window.getCodeFromBlock('Arduino');
                
                var code = codeEditor.window.editor.getValue();

                if(project.mode == "BLOCK")
                {
                    code = blockEditor.window.getCodeFromBlock('Arduino');
                }

                fs.writeFile(codePath + "/Code.ino", code, function (err) {
                    if (err) {
                        console.log("An error occurred creating the file " + err.message)
                    } else {
                        console.log("The file has been successfully saved")
                    }
                });
            });
        }

        var cmd = arduino.boardModel.dump.replace(/\\/g, "/");

        cmd = cmd.replace(/\$root\$/g, rootPath);
        cmd = cmd.replace(/\$cache\$/g, '"' + cachePath + '"');
        cmd = cmd.replace(/\$build\$/g, '"' + builtPath + '"');
        cmd = cmd.replace(/\$temp\$/g, '"' + codePath + '"');

        //consoleEditor.window.addCode('\n' + getDateMark() + ' [command]' + cmd);
        output.addMessage('\n' + getDateMark() + ' [command]' + cmd);

        let cmdStr = cmd;
        let cmdPath = '';
        let workerProcess;

        runExec();

        function runExec() 
        {
            // 执行命令行，如果命令不需要路径，或就是项目根目录，则不需要cwd参数：
            /*
            workerProcess = exec(cmdStr, {
                cwd: cmdPath,
            })
            */
            workerProcess = exec(cmdStr, {cwd: cmdPath, encoding: binaryEncoding});
            dumpProc = workerProcess;
            //alert(workerProcess.pid);
            
            // 不受child_process默认的缓冲区大小的使用方法，没参数也要写上{}：workerProcess = exec(cmdStr, {})
            //workerProcess.stdout.setEncoding('utf8');
            // 打印正常的后台可执行程序输出
            workerProcess.stdout.on('data', function (data) 
            {
                // 避免出现乱码
                data = iconv.decode(new Buffer(data, binaryEncoding), encoding);

                // 逐行拆分返回的控制台信息
                var index = data.indexOf('\n');

                while (index > -1) {
                    var line = data.substring(0, index);
                    data = data.substring(index + 1);

                    // 获取进度
                    if (line.indexOf("===info ||| Progress {0}") != -1) {
                        var s = line.indexOf('[');
                        var e = line.indexOf(']');

                        var p = line.substring(s + 1, e);

                        $("#progress").css("width", p.toString() + "%");
                    }

                    // 输出到控制台
                    //consoleEditor.window.addCode("\n" + getDateMark() + ' [info]' + line);
                    output.addMessage("\n" + getDateMark() + ' [info]' + line);

                    index = data.indexOf('\n');

                    // 滚屏
                    var count = consoleEditor.window.editor.getModel().getLineCount();
                    consoleEditor.window.editor.revealLine(count);
                }
            });

            // 打印错误的后台可执行程序输出
            workerProcess.stderr.on('data', function (data) 
            {
                // 避免出现乱码
                data = iconv.decode(new Buffer(data, binaryEncoding), encoding);

                // 输出错误信息
                output.addMessage("\n" + getDateMark() + ' [error]' + data);
            });

            // 退出之后的输出
            workerProcess.on('close', function (code) {
                console.log('out code：' + code);
                
                // 输出命令执行完毕信息
                output.addMessage("\n" + getDateMark() + ' [notice]' + "dump finish!");

                // 开始编译
                arduino.compile(next);
            })
        }
    },
    compile: function(next)
    {
        const exec = require('child_process').exec;
        const iconv = require('iconv-lite');
        const encoding = 'cp936';
        const binaryEncoding = 'binary';

        // 任何你期望执行的cmd命令，ls都可以
        //let cmdStr = './你的可执行程序名称 -p 需要输入密码的话'
        // 执行cmd命令的目录，如果使用cd xx && 上面的命令，这种将会无法正常退出子进程
        //let cmdPath = '执行cmd命令的路径' 
        // 子进程名称
        //let cmdStr = 'dir';

        const {
            remote
        } = require('electron');
        let tmpPath = remote.app.getPath('userData');

        var rootPath    = __dirname;
        var cachePath   = tmpPath + "/Cache";
        var builtPath   = tmpPath + "/Built";
        var codePath    = tmpPath + "/Code";

        // 判断当前系统类型
        if(kidin.os == 'win32')
        {
            // 如果是发布版
            if(kidin.isPublished == true)
            {
                rootPath = kidin.rootDir;
            }

            rootPath += "/hardware/windows/arduino";
        }
        else if(kidin.os == 'linux' || kidin.os == 'freebsd')
        {
            rootPath += "/hardware/linux/arduino";
        }
        else if(kidin.os == 'darwin')
        {
            rootPath += "/hardware/mac/arduino";
        }

        const fs = require('fs');

        var cmd = arduino.boardModel.compile.replace(/\\/g, "/");

        cmd = cmd.replace(/\$root\$/g, rootPath);
        cmd = cmd.replace(/\$cache\$/g, '"' + cachePath + '"');
        cmd = cmd.replace(/\$build\$/g, '"' + builtPath + '"');
        cmd = cmd.replace(/\$temp\$/g, '"' + codePath + '"');

        //consoleEditor.window.addCode('\n' + getDateMark() + ' [command]' + cmd);
        output.addMessage('\n' + getDateMark() + ' [command]' + cmd);

        let cmdStr = cmd;
        let cmdPath = '';
        let workerProcess;

        runExec();

        function runExec() 
        {
            // 执行命令行，如果命令不需要路径，或就是项目根目录，则不需要cwd参数：
            workerProcess = exec(cmdStr, {cwd: cmdPath, encoding: binaryEncoding});
            compileProc = workerProcess;
            // 不受child_process默认的缓冲区大小的使用方法，没参数也要写上{}：workerProcess = exec(cmdStr, {})
            // 打印正常的后台可执行程序输出
            workerProcess.stdout.on('data', function (data) 
            {
                //workerProcess.kill('SIGHUP');
                
                // 避免出现乱码
                data = iconv.decode(new Buffer(data, binaryEncoding), encoding);

                // 逐行拆分返回的控制台信息
                var index = data.indexOf('\n');

                while (index > -1) {
                    var line = data.substring(0, index);
                    data = data.substring(index + 1);

                    // 获取进度
                    if (line.indexOf("===info ||| Progress {0}") != -1) {
                        var s = line.indexOf('[');
                        var e = line.indexOf(']');

                        var p = line.substring(s + 1, e);

                        $("#progress").css("width", p.toString() + "%");
                    }

                    // 输出到控制台
                    //consoleEditor.window.addCode("\n" + getDateMark() + ' [compile]' + line);
                    output.addMessage("\n" + getDateMark() + ' [compile]' + line);
                    index = data.indexOf('\n');

                    // 滚屏
                    var count = consoleEditor.window.editor.getModel().getLineCount();
                    consoleEditor.window.editor.revealLine(count);
                }

                // [notice] Apache/1.3.29 (Unix) configured -- resuming normal operations
                // [info] Server built: Feb 27 2004 13:56:37
                // [error] [client xx.xx.xx.xx] File does not exist:
            });

            // 打印错误的后台可执行程序输出
            workerProcess.stderr.on('data', function (data) {
                console.log('stderr: ' + data);

                // 避免出现乱码
                data = iconv.decode(new Buffer(data, binaryEncoding), encoding);

                // 输出错误信息
                //consoleEditor.window.addCode("\n" + getDateMark() + ' [error]' + data);
                output.addMessage("\n" + getDateMark() + ' [error]' + data);
            });

            // 退出之后的输出
            workerProcess.on('close', function (code) {
                console.log('out code：' + code);
                
                // 输出命令执行完毕信息
                //consoleEditor.window.addCode("\n" + getDateMark() + ' [notice]' + "compile finish!");
                output.addMessage("\n" + getDateMark() + ' [notice]' + "compile finish!");
                //consoleEditor.window.addCode("\n\n\n");

                // 设置页脚栏状态
                //footerBar.setErrorState();
                //footerBar.setSuccessState();
                //footerBar.setNormalState();

                if(next == true)
                {
                    // 上传
                    arduino.upload();

                    // 屏蔽按钮
                    btnsEnable(false);
                }
                else
                {
                    // 弹出提示
                    gui.showTips("编译完成！", 1.5);

                    // 解除屏蔽
                    btnsEnable(true);
                }
            })
        }
    },
    upload: function(next)
    {
        const exec = require('child_process').exec;
        const iconv = require('iconv-lite');
        const encoding = 'cp936';
        const binaryEncoding = 'binary';

        // 任何你期望执行的cmd命令，ls都可以
        //let cmdStr = './你的可执行程序名称 -p 需要输入密码的话'
        // 执行cmd命令的目录，如果使用cd xx && 上面的命令，这种将会无法正常退出子进程
        //let cmdPath = '执行cmd命令的路径' 
        // 子进程名称
        //let cmdStr = 'dir';

        const {
            remote
        } = require('electron');
        let tmpPath = remote.app.getPath('userData');

        var rootPath    = __dirname;
        var cachePath   = tmpPath + "/Cache";
        var builtPath   = tmpPath + "/Built";
        var codePath    = tmpPath + "/Code";

        // 判断当前系统类型
        if(kidin.os == 'win32')
        {
            // 如果是发布版
            if(kidin.isPublished == true)
            {
                rootPath = kidin.rootDir;
            }

            rootPath += "/hardware/windows/arduino";
        }
        else if(kidin.os == 'linux' || kidin.os == 'freebsd')
        {
            rootPath += "/hardware/linux/arduino";
        }
        else if(kidin.os == 'darwin')
        {
            rootPath += "/hardware/mac/arduino";
        }

        const fs = require('fs');

        let cmd = arduino.boardModel.upload.replace(/\\/g, "/");

        cmd = cmd.replace(/\$root\$/g, rootPath);
        cmd = cmd.replace(/\$cache\$/g, '"' + cachePath + '"');
        cmd = cmd.replace(/\$build\$/g, '"' + builtPath + '"');
        cmd = cmd.replace(/\$temp\$/g, '"' + codePath + '"');
        //cmd = cmd.replace(/\$com\$/g, '"' + arduino.com + '"');

        let cmdStr = cmd;
        let cmdPath = '';
        let workerProcess;

        // 如果当前板型是Leonardo
        if(arduino.boardModel.reset == "true")
        {
            output.addMessage('\n' + getDateMark() + ' [command]' + "start to reset com device...");
            output.addMessage('\n' + getDateMark() + ' [command]' + "com device id from " + arduino.com + 'to ');

            // 重置串口
            device.resetComDev(arduino.com);

            setTimeout(function ()
            {
                // 跟新串口
                device.getComDev();
                
            }, 1000);

            setTimeout(function ()
            {
                output.addMessage(arduino.com);
                //alert(arduino.com);
                cmd = cmd.replace(/\$com\$/g, '"' + arduino.com + '"');
                cmdStr = cmd;
                output.addMessage('\n' + getDateMark() + ' [command]' + cmd + '\n');

                runExec();
                    
            }, 2000);
        }
        else
        {
            cmd = cmd.replace(/\$com\$/g, '"' + arduino.com + '"');
            cmdStr = cmd;
            output.addMessage('\n' + getDateMark() + ' [command]' + cmd + '\n');
            runExec();
        }

        function runExec() 
        {
            // 执行命令行，如果命令不需要路径，或就是项目根目录，则不需要cwd参数：
            workerProcess = exec(cmdStr, {
                cwd: cmdPath, encoding: binaryEncoding
            })
            // 不受child_process默认的缓冲区大小的使用方法，没参数也要写上{}：workerProcess = exec(cmdStr, {})
            uploadProc = workerProcess;
            // 打印正常的后台可执行程序输出
            workerProcess.stdout.on('data', function (data) 
            {
                // 避免出现乱码
                data = iconv.decode(new Buffer(data, binaryEncoding), encoding);

                // 逐行拆分返回的控制台信息
                var index = data.indexOf('\n');

                while (index > -1) {
                    var line = data.substring(0, index);
                    data = data.substring(index + 1);

                    // 获取进度
                    if (line.indexOf("===info ||| Progress {0}") != -1) {
                        var s = line.indexOf('[');
                        var e = line.indexOf(']');

                        var p = line.substring(s + 1, e);

                        $("#progress").css("width", p.toString() + "%");
                    }

                    // 输出到控制台
                    //consoleEditor.window.addCode("\n" + getDateMark() + ' [upload]' + line);
                    output.addMessage("\n" + getDateMark() + ' [upload]' + line);
                    index = data.indexOf('\n');

                    // 滚屏
                    var count = consoleEditor.window.editor.getModel().getLineCount();
                    consoleEditor.window.editor.revealLine(count);
                }

                // [notice] Apache/1.3.29 (Unix) configured -- resuming normal operations
                // [info] Server built: Feb 27 2004 13:56:37
                // [error] [client xx.xx.xx.xx] File does not exist:
            });

            // 打印错误的后台可执行程序输出
            workerProcess.stderr.on('data', function (data) {
                console.log('stderr: ' + data);

                // 避免出现乱码
                data = iconv.decode(new Buffer(data, binaryEncoding), encoding);

                // 逐行拆分返回的控制台信息
                var index = data.indexOf('\n');

                while (index > -1) {
                    var line = data.substring(0, index);
                    data = data.substring(index + 1);

                    // 获取进度
                    if (line.indexOf("===info ||| Progress {0}") != -1) {
                        var s = line.indexOf('[');
                        var e = line.indexOf(']');

                        var p = line.substring(s + 1, e);

                        $("#progress").css("width", p.toString() + "%");
                    }

                    // 输出到控制台
                    //consoleEditor.window.addCode(getDateMark() + ' [upload]' + line);
                    output.addMessage(getDateMark() + ' [upload]' + line);
                    index = data.indexOf('\n');

                    // 滚屏
                    var count = consoleEditor.window.editor.getModel().getLineCount();
                    consoleEditor.window.editor.revealLine(count);
                }
            });

            // 退出之后的输出
            workerProcess.on('close', function (code) {
                console.log('out code：' + code);
                
                // 输出命令执行完毕信息
                //consoleEditor.window.addCode(getDateMark() + ' [notice]' + "upload finish!");
                output.addMessage(getDateMark() + ' [notice]' + "upload finish!");

                // 设置控制台不可编辑
                consoleEditor.window.setEditable(false);

                // 弹出提示
                gui.showTips("上传结束！", 1.5);

                // 解除屏蔽
                btnsEnable(true);
            })
        }
    }
}

// 设置按钮状态
function btnsEnable(enable)
{
    if(enable == true)
    {
        // 恢复按钮
        $("#btnCompile").css('pointer-events', 'auto');
        $("#btnCompile").css('opacity', '1');
        $("#btnUpload").css('pointer-events', 'auto');
        $("#btnUpload").css('opacity', '1');
        $("#btnUpdate").css('pointer-events', 'auto');
        $("#btnUpdate").css('opacity', '1');
        $("#listCom").css('pointer-events', 'auto');
        $("#listCom").css('opacity', '1');
        $("#listCom-2").css('pointer-events', 'auto');
        $("#listCom-2").css('opacity', '1');
        $("#listBoard").css('pointer-events', 'auto');
        $("#listBoard").css('opacity', '1');
        $("#listBoard-2").css('pointer-events', 'auto');
        $("#listBoard-2").css('opacity', '1');
    }
    else
    {
        // 屏蔽按钮
        $("#btnCompile").css('pointer-events', 'none');
        $("#btnCompile").css('opacity', '0.4');
        $("#btnUpload").css('pointer-events', 'none');
        $("#btnUpload").css('opacity', '0.4');
        $("#btnUpdate").css('pointer-events', 'none');
        $("#btnUpdate").css('opacity', '0.4');
        $("#listCom").css('pointer-events', 'none');
        $("#listCom").css('opacity', '0.4');
        $("#listCom-2").css('pointer-events', 'none');
        $("#listCom-2").css('opacity', '0.4');
        $("#listBoard").css('pointer-events', 'none');
        $("#listBoard").css('opacity', '0.4');
        $("#listBoard-2").css('pointer-events', 'none');
        $("#listBoard-2").css('opacity', '0.4');
    }
}

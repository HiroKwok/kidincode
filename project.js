var project = 
{
    name:String,
    mode:String,
    type:String,
    code:String,
    xml:String,
    isSave:Boolean,
    path:String,
    com:String,
    board:String,

    init: function()
    {
        isSave = false;

        this.name   = "";
        this.mode   = "";
        this.type   = "";
        this.path   = "";
        this.com    = "";
        this.board  = "";
        this.xml    = "";

        // 读取临时文件
        config.readTmp();
    },
    createPrj: function(name, mode, type)
    {
        project.name = name;
        project.mode = mode;
        project.type = type;
        
        let suffix = "";

        if(project.type == "ARDUINO")
        {
            suffix = ".ino";

            // 如果当前不是Arduino编辑器则重新载入
            if(gui.codeEditor.attr("src") != "./editors/monaco-editor-0-18-0/arduino.html")
            {
                // 更改编辑器
                gui.codeEditor.attr("src", "./editors/monaco-editor-0-18-0/arduino.html");
            }
            else
            {
                let code = "\n// First line\nvoid setup()\n{\n\tpinMode(13, OUTPUT);\n}\n" + "\nvoid loop()\n{\n\tdigitalWrite(13, HIGH);\n}\n// Last line";

                codeEditor.window.editor.setValue(code);
            }
        }
        else if(project.type == "MICRO_BIT")
        {
            suffix = ".py";

            // 如果当前不是Microbit编辑器则重新载入
            if(gui.codeEditor.attr("src") != "./editors/monaco-editor-0-18-0/microbit.html")
            {
                // 更改编辑器
                gui.codeEditor.attr("src", "./editors/monaco-editor-0-18-0/microbit.html");
            }
            else
            {
                let code = 'from microbit import *\ndisplay.scroll("Hello, World!")';

                codeEditor.window.editor.setValue(code);
            }
        }
        else if(project.type == "MICRO_PYTHON")
        {
            suffix = ".py";

            // 更改编辑器
            gui.codeEditor.attr("src", "./editors/monaco-editor-0-18-0/micropython.html");
        }

        // 设置标题栏(标题栏应该再简化)
        gui.titleBar.titleTxt.text(project.type + "  项目 - " + project.name + " - KIDIN CODE");

        // 项目按钮恢复点击
        gui.tabsBar.tabFile.css('pointer-events', 'auto');
        gui.tabsBar.tabFile.text("项目");
        gui.tabsBar.tabFile.css("background", "");
        gui.tabsBar.tabCode.show();
        gui.tabsBar.tabComm.show();
        gui.tabsBar.tabUpload.show();

        if(project.mode == "BLOCK")
        {
            // 积木编辑器不能重复加载（alpha版本暂时只支持Arduino）
            if(project.type == "ARDUINO")
            {
                // 获取当前积木XML代码
                let tmpXML = blockEditor.window.getXmlFromBlock();

                // 如果积木内容不为空白
                if(tmpXML != '<xml xmlns="http://www.w3.org/1999/xhtml"><variables></variables></xml>')
                {
                    $("#blockLoadAni").show();
                    gui.blocksEditor.hide();

                    // 清空积木内容
                    project.xml = '<xml xmlns="http://www.w3.org/1999/xhtml"><variables></variables></xml>';

                    // 更改积木编辑器
                    gui.blocksEditor.attr("src", "./editors/blockly-pxt/pxt-blockly/app/arduino.html?lang=zh-hans");
                }

                // 更改编辑器(Arduino)
                //gui.codeEditor.attr("src", "./editors/monaco-editor-0-18-0/arduino.html");
            }
            else if(project.type == "MICRO_BIT")
            {
                suffix = ".py";

                // 更改积木编辑器
                gui.blocksEditor.attr("src", "./editors/blockly-pxt/pxt-blockly/app/arduino.html?lang=zh-hans");
    
                // 更改编辑器(Micro:bit)
                gui.codeEditor.attr("src", "./editors/monaco-editor-0-18-0/microbit.html");
            }
            else if(project.type == "MICRO_PYTHON")
            {
                suffix = ".py";

                // 更改积木编辑器
                gui.blocksEditor.attr("src", "./editors/blockly-pxt/pxt-blockly/app/arduino.html?lang=zh-hans");
    
                // 更改编辑器(MicroPython)
                gui.codeEditor.attr("src", "./editors/monaco-editor-0-18-0/micropython.html");
            }

            //project.xml = blockEditor.window.getXmlFromBlock();
            // 以积木模式开启
            gui.tabsBar.tabBlock.show();
            gui.tabsBar.tabBlock.click();

            // 更新编辑器状态
            codeEditor.window.setIsChange(false);
        }
        else
        {
            // 以代码模式开启
            gui.tabsBar.tabCode.click();
        }

        // 显示页脚状态栏
        gui.footerBar.footer.show();
         
        // 隐藏图标栏
        gui.titleBar.iconArea.hide();

        // 创建项目时恢复显示状态
        gui.prjMenu.itemOpen.show();
        gui.prjMenu.itemSave.show();
        gui.prjMenu.itemSaveAs.show();
    },
    createNewPrj: function()
    {
        // 创建新项目
        const child_process = require('child_process');
        const path = require('path');

        let arg = " mode=" + project.getPrjMode() + " type=" + project.getPrjType();

        const fs = require('fs');

        // 发布版主程序根目录
        let exeRoot = path.resolve(__dirname, '../../');

        // 发布版启动命令
        let cmd = exeRoot + "/kidin.exe";

        // 如果不是发布版
        if (!fs.existsSync(cmd))
        {
            cmd = "electron .";
        }

        //var old = child_process.spawn('electron .',{
        //var old = child_process.exec('electron .' + arg,
        var old = child_process.exec(cmd + arg,
        //var old = child_process.exec(process.argv,
        {
            //cwd:path.join(__dirname,""),    //运行子进程的目录
            detached:true,                  //让父进程退出后，子进程能独立运行
            //shell: process.platform === 'win32',
            windowsHide:true
        });
    },
    // 获取开发模式
    getPrjMode: function()
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
    },
    // 获取项目类型
    getPrjType: function()
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
    },
    openPrjSync:function (path)
    {
        if(!path)
        {
            const {dialog} = require('electron').remote;

            let result = dialog.showOpenDialogSync({
                    properties: ['openFile'],
                    filters: [{name: 'Projecs', extensions: ['ino', 'abp', 'py' ,'mbp']},
                            {name: 'Arduino', extensions: ['ino']}, 
                            {name: 'Arduino', extensions: ['abp']},
                            {name: 'Micro-bit', extensions: ['py']},
                            {name: 'Micro-bit', extensions: ['mbp']},
                            {name: 'MicroPython', extensions: ['py']},
                            {name: 'All Files', extensions: ['*']}]
            });

            // 获取文件地址
            path = result[0];
        }

        // 读取代码文件
        const fs = require('fs');

        if (fs.existsSync(path))
        {
            let data = fs.readFileSync(path, 'utf8');

            // 询问是否创建新窗口
            let result = project.ifCreateWindow();

            // 创建Arduino代码项目
            if(path.split('.')[1] === "ino")
            {
                // 创建新窗口    
                if(result == 0)
                {
                    config.mode = "CODE";
                    config.type = "ARDUINO";

                    // 写入临时文件（传递项目路径）
                    config.writeTmp(path);

                    // 创建新项目窗口
                    project.createNewPrj();
                }
                // 不创建窗口
                else if(result == 1)
                {
                    // 如果当前代码内容已经被修改
                    if(codeEditor.window.getIsChange())
                    {
                        let save = project.ifSavePrj();

                        if(save == 0)
                        {
                            // 先保存再创建
                            project.savePrjSync();
                        }
                    }

                    // 获取当前项目名称
                    let prjName = kidin.unifyPath(path);

                    // 创建Arduino代码项目
                    project.createPrj(prjName, "CODE", "ARDUINO");

                    // 读取代码
                    codeEditor.window.editor.setValue(data);

                    // 设置项目保存路径
                    project.path = path;

                    // 更新编辑器状态
                    codeEditor.window.setIsChange(false);
                }
            }
            else if(path.split('.')[1] === "abp")
            {
                // 创建新窗口    
                if(result == 0)
                {
                    config.mode = "BLOCK";
                    config.type = "ARDUINO";

                    // 写入临时文件（传递项目路径）
                    config.writeTmp(path);

                    // 创建新项目窗口
                    project.createNewPrj();
                }
                // 不创建窗口
                else if(result == 1)
                {
                    // 获取当前项目名称
                    let prjName = kidin.unifyPath(path);

                    // 创建Arduino积木项目
                    project.createPrj(prjName, "BLOCK", "ARDUINO");

                    blockEditor.window.setXmlToBlock(data);

                    project.xml = data;

                    // 设置项目保存路径
                    project.path = path;

                    // 更新编辑器状态
                    codeEditor.window.setIsChange(false);
                } 
            }
        }
    },
    savePrjSync:function (isSaveAs)
    {
        // 从积木获取代码
        //var code = blockEditor.window.getCodeFromBlock('Arduino');

        // 从编辑器获取代码
        let code = codeEditor.window.editor.getValue();

        //alert(code);

        // 从积木获取XML
        let xml = blockEditor.window.getXmlFromBlock();

        project.xml = xml;

        //alert(xml);

        const {dialog} = require('electron').remote;

        let result          = "";
        let filtersName     = "";
        let filtersExtens   = "";

        // 从积木更新代码
        if(project.mode == "BLOCK")
        {
            codeEditor.window.editor.setValue(blockEditor.window.getCodeFromBlock('Arduino'));
        }

        if(project.path == "" || isSaveAs == true)
        {
            // abp - Arduino Blockly Project
            // mbp - Micro:bit Blockly Project
            // mpp - MicroPython Blockly Project

            // 判断当前项目类型
            if(project.mode == "CODE" && project.type == "ARDUINO")
            {
                // Arduino代码项目
                filtersName = 'Arduino';
                filtersExtens = 'ino'
            }
            else if(project.mode == "BLOCK" && project.type == "ARDUINO")
            {
                // Arduino积木项目
                filtersName = 'Arduino';
                filtersExtens = 'abp'
            }
            if(project.mode == "CODE" && project.type == "MICRO_BIT")
            {
                // Arduino代码项目
                filtersName = 'Python';
                filtersExtens = 'py'
            }
            if(project.mode == "CODE" && project.type == "MICRO_PYTHON")
            {
                // Arduino代码项目
                filtersName = 'Python';
                filtersExtens = 'py'
            }

            // 通过对话框获取文件路径
            result = dialog.showSaveDialogSync({

                title: 'save file',
                defaultPath: project.name,
                filters: [{
                        name: filtersName,
                        extensions: [filtersExtens]
                    },
                    {
                        name: 'All Files',
                        extensions: ['*']
                    }
                ]
            });
        }
        else
        {
            // 文件已经有路径
            result = project.path;
        }

        // 如果路径存在
        if (result) 
        {
            const fs = require('fs');

            if(filtersExtens == 'abp')
            {
                // 如果是积木模式项目
                code = xml;
            }

            let rootPath = __dirname;

            // 判断当前系统类型
            if(kidin.os == 'win32')
            {
                // 如果是发布版
                if(kidin.isPublished == true)
                {
                    rootPath = kidin.rootDir;
                }
            }
            else if(kidin.os == 'linux' || kidin.os == 'freebsd')
            {

            }
            else if(kidin.os == 'darwin')
            {

            }
            
            // 不能把项目保存到示例文件夹中
            if(result.indexOf(rootPath + "/examples/") == 0)
            {
                // 更新页面
                refresh();

                // 弹出提示
                gui.showTips("不能把项目保存到当前目录！", 1.5);

                return;
            }

            // 以同步的方式保存文件
            fs.writeFileSync(result, code);

            // 保存后更新路径
            project.path = result;

            // 更新至已保存状态
            project.isSave = true;

            // 更新项目标题
            project.name = result;

            // 判断当前系统类型
            const os = require('os');
            let sys = os.platform();
            let prjName = "";

            let path = result;

            // 统一路径符号
            if(sys == 'win32')
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

            project.name = prjName;

            gui.titleBar.titleTxt.text(project.type + "  项目 - " + project.name + " - KIDIN CODE");

            // 更新页面
            refresh();

            // 更新编辑器状态
            codeEditor.window.setIsChange(false);

            // 更新项目标题

            // 弹出提示
            gui.showTips("保存成功！", 1.5);
        } 
        else 
        {
            //alert("Cancel");
        }

        function refresh()
        {
            gui.tabsBar.tabFile.text("项目");
            gui.tabsBar.tabFile.css("background", "");
            gui.tabsBar.tabCode.show();
            gui.tabsBar.tabComm.show();
            gui.tabsBar.tabUpload.show();
            gui.titleBar.iconArea.hide();
            footerBar.show();
                            
            if(project.mode == "CODE")
            {
                // 成功保存后返回代码编辑标签页面
                gui.tabsBar.tabCode.click();
            }
            else
            {
                // 成功保存后返回积木编辑标签页面
                gui.tabsBar.tabBlock.show();
                gui.tabsBar.tabBlock.click();
            }
        }
    },
    ifCreateWindow : function()
    {
        // 在新建窗口创建项目
        if(project.name != "")
        {
            const {dialog} = require('electron').remote;

            let result = dialog.showMessageBoxSync(
                {
                    title:"温馨提示",
                    message:"是否为新项目创建窗口？",
                    type:'question', // 可以为 "none", "info", "error", "question" 或者 "warning". 
                    buttons:["是", "否", "取消"]
                });

                if(result == 0)
                {
                    return 0;
                }
                else if(result == 1)
                {
                    return 1;
                }
                else
                {
                    return 2;
                }
        }
        else
        {
            return 1;
        }
    },
    ifSavePrj : function(isShowCancel)
    {
        const {dialog} = require('electron').remote;

        let save = null;

        if(isShowCancel == true)
        {
            save = dialog.showMessageBoxSync(
            {
                title:"温馨提示",
                message:"是否保存对项目 "+ project.name +" 的修改",
                type:'question', // 可以为 "none", "info", "error", "question" 或者 "warning". 
                buttons:["保存", "不保存", "取消"]
            });
        }
        else
        {
            save = dialog.showMessageBoxSync(
                {
                    title:"温馨提示",
                    message:"是否保存对项目 "+ project.name +" 的修改",
                    type:'question', // 可以为 "none", "info", "error", "question" 或者 "warning". 
                    buttons:["保存", "不保存"]
                });
        }

        if(save == 0)
        {
            return 0;
        }
        else if(save == 1)
        {
            return 1;
        }
        else
        {
            return 2;
        }
    }
}
var gui = 
{
    titleBar : Object(),
    tabsBar  : Object(),
    footerBar: Object(),
    startPage: Object(),
    prjMenu  : Object(),
    codeEditor: Object(),
    blocksEditor: Object(),
    consoleEditor: Object(),
    webSerialTools: Object(),

    init: function () 
    {
        this.titleBar   = titleBar;
        this.tabsBar    = tabsBar;
        this.footerBar  = footerBar;
        this.startPage  = startPage;
        this.prjMenu    = prjMenu;

        this.codeEditor = $("#codeEditor");
        this.blocksEditor = $("#blockEditor");
        this.consoleEditor = $("#consoleEditor");
        this.webSerialTools = $("#webSerialTools");

        // 加载库并生成列表
        this.loadLibs();

        // 加载外部工具
        this.codeEditor.attr("src", "./editors/monaco-editor-0-18-0/arduino.html");
        this.blocksEditor.attr("src", "./editors/blockly-pxt/pxt-blockly/app/arduino.html?lang=zh-hans");
        this.consoleEditor.attr("src", "./editors/monaco-editor-0-18-0/console.html");
        this.webSerialTools.attr("src", "http://127.0.0.1:8080");

        // 读取配置文件
        config.read();

        // 初始化标题栏
        this.titleBar.init();

        // 初始化标签栏
        this.tabsBar.init();

        // 初始化页脚栏
        this.footerBar.init();

        // 初始化开始页面
        this.startPage.init();

        // 初始化项目菜单
        this.prjMenu.init();

        // 初始化项目信息
        project.init();

        // 读取临时文件
        //config.readTmp();

        //footerBar.setErrorState();
        //footerBar.setSuccessState();
        this.footerBar.setNormalState();
    },

    /** 
    * 加载库文件并生成列表 
    */ 
    loadLibs: function()
    {
        var path = require('path');
        var fs = require("fs");

        let libsPath = __dirname + '/hardware/windows/arduino/libraries/';

        // 判断当前系统类型
        if(kidin.os == 'win32')
        {
            // 如果是发布版
            if(kidin.isPublished == true)
            {
                libsPath = kidin.rootDir + '/hardware/windows/arduino/libraries/';
            }
        }
        else if(kidin.os == 'linux' || kidin.os == 'freebsd')
        {

        }
        else if(kidin.os == 'darwin')
        {

        }

        // json数组
        let data = [];
            
        // 读取范例目录
        let filelist = fs.readdirSync(libsPath);

        for (var i = 0; i < filelist.length; i++)
        {
            let subPath = libsPath + filelist[i];
            let subList = fs.readdirSync(subPath);

            for (var j = 0; j < subList.length; j++)
            {
                // 获取后缀名为.h的头文件
                var extname = path.extname(subList[j]); // 获取文件的后缀名

                if(extname == ".h")
                {
                    // 获取头文件
                    //debug.log("h: " + subList[j]);

                    // 把库文件名称添加到json数据中
                    data.push({lib:subList[j]})

                    // 在这里解析头文件获取函数原型
                    // ...
                }
            }
        }

        // 数组转json字符串
        let jsonObj = JSON.stringify(data);

        jsonObj = "libs='" + jsonObj + "'"

        // 把配置信息写入libs.json文件
        // 这个文件将由编辑器页面静态引入
        fs.writeFileSync("./libs.json", jsonObj);
    },

    /** 
    * 浮动DIV定时显示提示信息,如操作成功, 失败等 
    * @param string tips (提示的内容) 
    * @param int height 显示的信息距离浏览器顶部的高度 
    * @param int time 显示的时间(按秒算), time > 0 
    * @sample <a href="javascript:void(0);" onclick="showTips( '操作成功', 100, 3 );">点击</a> 
    * @sample 上面代码表示点击后显示操作成功3秒钟, 距离顶部100px 
    * @copyright Tansor 2020-06-01 
    */ 
    showTips: function(tips, time)
    { 
        var windowWidth = document.documentElement.clientWidth;
        var windowHeight = document.documentElement.clientHeight; 

        var tipsDiv = '<div class="tipsClass">' + tips + '</div>';
        
        // 如果元素存在先删除
        $('div.tipsClass').remove();
        
        $('body').append(tipsDiv);
        $('div.tipsClass').css({ 
            'top' : (windowHeight / 2) - (100 / 2) + 'px', 
            'left' : (windowWidth / 2) - (200 / 2) + 'px', 
            'position' : 'absolute', 
            /*'padding' : '3px 5px', */
            'background': '#333333', 
            'font-size' : 16 + 'px', 
            'margin' : '0 auto', 
            'text-align': 'center',
            'height': '100px',
            'line-height': '100px',
            'width' : '250px', 
            'color' : '#fff', 
            'opacity' : '0.85'
        }).hide();
        
        $('div.tipsClass').fadeIn(500);

        setTimeout( function(){$('div.tipsClass').fadeOut();}, ( time * 1000 ) ); 
    }
}

var startPage = 
{
    btnModeCode: Object(),
    btnModeBlock: Object(),

    btnTypeArduino: Object(),
    btnTypeMicrobit: Object(),
    btnTypeMicroPython: Object(),

    init: function()
    {
        this.btnModeCode        = $("#btnModeCode");
        this.btnModeBlock       = $("#btnModeBlock");

        this.btnTypeArduino     = $("#btnTypeArduino");
        this.btnTypeMicrobit    = $("#btnTypeMicrobit");
        this.btnTypeMicroPython = $("#btnTypeMicroPython");

        gui.tabsBar.tabFile.content.show();
        gui.tabsBar.tabFile.css("background-color", "#1E1E1E");

        // 项目按钮不能点击
        $("#tabFile").css('pointer-events', 'none');

        // --alpha版本屏蔽Arduino以外的项目创建操作（不能点击）
        this.btnTypeMicrobit.css('pointer-events', 'none');
        this.btnTypeMicrobit.css('opacity', '0.3');
        this.btnTypeMicroPython.css('pointer-events', 'none');
        this.btnTypeMicroPython.css('opacity', '0.3');

        $("#saveOpt").css('pointer-events', 'none');
        $("#saveOpt").css('opacity', '0.3');
        // --
        
        var modeItems = new Array();

        modeItems.push(this.btnModeCode);
        modeItems.push(this.btnModeBlock);

        modeItems.forEach(function (item) 
        {
            // 默认全部隐藏
            item.css("background-color", "#333333");
            item.css("color", "#FFFFFF");

            item.click(function ()
            {
                modeItems[0].css("background-color", "#333333");
                modeItems[1].css("background-color", "#333333");

                item.css("background-color", "#007abb");
            
                modeItems[0].isSelected = false;
                modeItems[1].isSelected = false;

                item.isSelected = true;
            });

            item.mouseover(function ()
            {
                if(item.isSelected != true)
                {
                    item.css("background-color", "#505050");
                }
            });

            item.mouseout(function ()
            {
                if(item.isSelected != true)
                {
                    item.css("background-color", "#333333");
                }
            });
        });

        // 默认选中代码模式
        modeItems[0].isSelected = true;
        modeItems[0].css("background-color", "#007abb");

        var typeItems = new Array();

        typeItems.push(this.btnTypeArduino);
        typeItems.push(this.btnTypeMicrobit);
        typeItems.push(this.btnTypeMicroPython);

        typeItems.forEach(function (item) 
        {
            // 默认全部隐藏
            item.css("background-color", "#333333");

            item.click(function ()
            {
                typeItems[0].css("background-color", "#333333");
                typeItems[1].css("background-color", "#333333");
                typeItems[2].css("background-color", "#333333");

                item.css("background-color", "#007abb");

                typeItems[0].isSelected = false;
                typeItems[1].isSelected = false;
                typeItems[2].isSelected = false;

                item.isSelected = true;

                config.mode = project.getPrjMode();
                config.type = project.getPrjType();
                
                // 在新建窗口创建项目
                if(project.name != "")
                {
                    let result = project.ifCreateWindow();

                    if(result == 0)
                    {
                        // 创建临时文件写入项目信息
                        config.writeTmp();

                        // 创建新项目窗口
                        project.createNewPrj();
                    }
                    else if(result == 1)
                    {
                        // 从积木更新代码
                        if(project.mode == "BLOCK")
                        {
                            // XML内容有修改
                            if(project.xml != blockEditor.window.getXmlFromBlock())
                            {
                                let save = project.ifSavePrj();

                                if(save == 0)
                                {
                                    // 先保存再创建
                                    project.savePrjSync();
                                }
                            }
                        }
                        else if(project.mode == "CODE")
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
                        }

                        // 创建新项目
                        project.createPrj("未命名", project.getPrjMode(), project.getPrjType());
                    }
                    else if(result == 2)
                    {
                        // 取消
                    }
                }
                else
                {
                    // 创建新项目
                    project.createPrj("未命名", getPrjMode(), getPrjType());
                }
            });

            item.mouseover(function ()
            {
                //item.css("background-color", "#505050");
                item.css("background-color", "#007abb");
            });

            item.mouseout(function ()
            {
                item.css("background-color", "#333333");
            });
        });
    }
}

var footerBar = 
{
    footer: Object(),

    init: function()
    {
        this.footer = $("#footer");
    },
    setNormalState: function()
    {
        this.footer.css("background-color", "#007ACC");
    },
    setErrorState: function()
    {
        this.footer.css("background-color", "#CC0000");
    },
    setSuccessState: function()
    {
        this.footer.css("background-color", "#009900");
    },
    hide: function()
    {
        this.footer.hide();
    },
    show: function()
    {
        this.footer.show();
    }
}

var prjMenu = 
{
    itemNew: Object(),
    itemOpen: Object(),
    itemSave: Object(),
    itemSaveAs: Object(),
    itemExample: Object(),
    itemSetting: Object(),
    itemAbout: Object(),

    pageNew: Object(),
    pageExample: Object(),
    pageSetting: Object(),
    pageAbout: Object(),

    init: function ()
    {
        itemNew     = $("#fileNew");
        itemOpen    = $('#fileOpen');
        itemSave    = $('#fileSave');
        itemSaveAs  = $('#fileSaveAs');
        itemExample = $("#fileExample");
        itemSetting = $("#fileSetting");
        itemAbout   = $("#fileAbout");

        this.itemNew     = itemNew;
        this.itemOpen    = itemOpen;
        this.itemSave    = itemSave;
        this.itemSaveAs  = itemSaveAs;
        this.itemExample = itemExample;
        this.itemSetting = itemSetting;
        this.itemAbout   = itemAbout;

        pageNew     = $("#pageNew");
        pageExample = $("#pageExample");
        pageSetting = $("#pageSetting");
        pageAbout   = $("#pageAbout");

        this.pageNew     = pageNew;
        this.pageExample = pageExample;
        this.pageSetting = pageSetting;
        this.pageAbout   = pageAbout;

        this.itemNew.content     = pageNew;
        this.itemExample.content = pageExample;
        this.itemSetting.content = pageSetting;
        this.itemAbout.content   = pageAbout;

        // 初始化时以下菜单项为隐藏状态
        this.itemSave.hide();
        this.itemSaveAs.hide();

        this.itemNew.css("background-color", "#252526");
        
        // 点击新建按钮
        this.itemNew.click(function () 
        {
            pageNew.show();
            pageExample.hide();
            pageSetting.hide();
            pageAbout.hide();

            itemNew.css("background-color", "#252526");
            itemExample.css("background-color", "#1E1E1E");
            itemSetting.css("background-color", "#1E1E1E");
            itemAbout.css("background-color", "#1E1E1E");
        });

        // 点击范例按钮
        this.itemExample.click(function ()
        {
            pageNew.hide();
            pageExample.show();
            pageSetting.hide();
            pageAbout.hide();

            itemExample.css("background-color", "#252526");
            itemNew.css("background-color", "#1E1E1E");
            itemSetting.css("background-color", "#1E1E1E");
            itemAbout.css("background-color", "#1E1E1E");

            // 通过范例创建项目
            createPrjFromExample();
        });

        // 点击选项按钮
        this.itemSetting.click(function ()
        {
            pageNew.hide();
            pageExample.hide();
            pageSetting.show();
            pageAbout.hide();

            itemExample.css("background-color", "#1E1E1E");
            itemNew.css("background-color", "#1E1E1E");
            itemSetting.css("background-color", "#252526");
            itemAbout.css("background-color", "#1E1E1E");
        });

        // 点击关于按钮
        this.itemAbout.click(function ()
        {
            pageNew.hide();
            pageExample.hide();
            pageSetting.hide();
            pageAbout.show();

            itemExample.css("background-color", "#1E1E1E");
            itemNew.css("background-color", "#1E1E1E");
            itemSetting.css("background-color", "#1E1E1E");
            itemAbout.css("background-color", "#252526");
        });

        var createPrjFromExample = function ()
        {
            var path = require('path');
            var fs = require("fs");

            // 发布版主程序根目录
            //let exeRoot = path.resolve(__dirname, '../../');
            let examplePath = __dirname + '/examples/';

            // 判断当前系统类型
            if(kidin.os == 'win32')
            {
                // 如果是发布版
                if(kidin.isPublished == true)
                {
                    examplePath = kidin.rootDir + '/examples/';
                }
            }
            else if(kidin.os == 'linux' || kidin.os == 'freebsd')
            {

            }
            else if(kidin.os == 'darwin')
            {

            }
            
            // 读取范例目录
            //var fs = require("fs");
            var filelist = fs.readdirSync(examplePath);

            var examples = new Array();

            // 清除所有元素
            $("#tagLevel01").html("");
            $("#tagLevel02").html("");
            $("#tagPrjs").html("");

            for (var i = 0; i < filelist.length; i++)
            {
                examples[i] = new Object();

                examples[i].dir = filelist[i];

                let level2list = fs.readdirSync(examplePath + filelist[i]);

                examples[i].sub = new Array();

                for(var j = 0; j < level2list.length; j++)
                {
                    if(!fs.lstatSync(examplePath + filelist[i] + '/' + level2list[j]).isDirectory())
                    {
                        continue;
                    }

                    examples[i].sub[j] = new Object();

                    examples[i].sub[j].dir = level2list[j];
                    examples[i].sub[j].sub = new Array();
                    
                    let level3list = fs.readdirSync(examplePath + filelist[i] + '/' + level2list[j]);

                    for(var k = 0; k < level3list.length; k++)
                    {
                        if(!fs.lstatSync(examplePath + filelist[i] + '/' + level2list[j] + '/' + level3list[k]).isDirectory())
                        {
                            continue;
                        }

                        examples[i].sub[j].sub[k] = new Object();

                        examples[i].sub[j].sub[k].dir = level3list[k];
                        examples[i].sub[j].sub[k].sub = new Array();

                        let level4list = fs.readdirSync(examplePath + filelist[i] + '/' + level2list[j] + '/' + level3list[k]);
                        
                        for(var t = 0; t < level4list.length; t++)
                        {
                            if(!fs.lstatSync(examplePath + filelist[i] + '/' + level2list[j] + '/' + level3list[k] + '/' + level4list[t]).isDirectory())
                            {
                                continue;
                            }
                            
                            examples[i].sub[j].sub[k].sub[t] = new Object();

                            examples[i].sub[j].sub[k].sub[t].dir = level4list[t];
                            examples[i].sub[j].sub[k].sub[t].sub = new Array();

                            try
                            {
                                if(!fs.lstatSync(examplePath + filelist[i] + '/' + level2list[j] + '/' + level3list[k] + '/' + level4list[t]).isDirectory())
                                {
                                    continue;
                                }
                                let level5list = fs.readdirSync(examplePath + filelist[i] + '/' + level2list[j] + '/' + level3list[k] + '/' + level4list[t]);

                                for(var c = 0; c < level5list.length; c++)
                                {
                                    //
                                    var path = require('path'); /*nodejs自带的模块*/
                                    var extname = path.extname(level5list[c]); //获取文件的后缀名
                                    
                                    examples[i].sub[j].sub[k].sub[t].sub[c] = new Object();

                                    if(extname == ".ino" || extname == ".py")
                                    {
                                        examples[i].sub[j].sub[k].sub[t].sub[c].file = level5list[c];
                                    }
                                }
                            }
                            catch(err)
                            {
                                alert(err);
                            }
                        }
                    }
                }
            }
            
            // 创建UI
            for (let i = 0; i < examples.length; i++) 
            {
                var sp = '<span><button class="kd-tag" id = "tag'+examples[i].dir+'">' + examples[i].dir + '</button></span>';

                $("#tagLevel01").append(sp);

                let tag = $("#tag" + examples[i].dir);

                examples[i].tag = tag;

                tag.click(function ()
                {
                    tag.tags = new Array();

                    for(let d = 0; d < examples.length; d++)
                    {
                        examples[d].tag.css("background-color", "#3C3C3C");
                        examples[d].tag.css("color", "#CCCCCC");
                    }

                    tag.css("background-color", "#007ACC");
                    tag.css("color", "#FFFFFF");

                    let keyword = this.innerText;

                    $("#tagLevel02").html("");

                    for (let j = 0; j < examples.length; j++) 
                    {
                        if(examples[j].dir == keyword)
                        {
                            for(let k = 0; k < examples[j].sub.length; k++)
                            {
                                var sp2 = '<span><button class="kd-tag" id = "tag2'+examples[j].sub[k].dir+'">' + examples[j].sub[k].dir + '</button></span>';

                                $("#tagLevel02").append(sp2);

                                let tag2 = $("#tag2" + examples[j].sub[k].dir);

                                examples[j].sub[k].tag = tag2;

                                tag.tags.push(tag2);

                                tag2.click(function ()
                                {
                                    for(let f = 0; f < examples[j].sub.length; f++)
                                    {
                                        examples[j].sub[f].tag.css("background-color", "#3C3C3C");
                                        examples[j].sub[f].tag.css("color", "#CCCCCC");
                                    }

                                    tag2.css("background-color", "#007ACC");
                                    tag2.css("color", "#FFFFFF");

                                    $("#tagPrjs").html("");

                                    for(let c = 0; c < examples[j].sub[k].sub.length; c++)
                                    {
                                        $("#tagPrjs").append("<div style='color:#AAAAAA;margin-left:-40px;padding: 10px;'>" +examples[j].sub[k].sub[c].dir+"</div>");

                                        $("#tagPrjs").append("<div>");
                                        
                                        for(let t = 0; t < examples[j].sub[k].sub[c].sub.length; t++)
                                        {
                                            let curPath = examplePath + examples[j].dir + "/" + examples[j].sub[k].dir + "/" + examples[j].sub[k].sub[c].dir + "/" + examples[j].sub[k].sub[c].sub[t].dir + "/"

                                            curPath = curPath + "icon.jpg";

                                            // 判断当前路径下是否存在自定义主图
                                            if (!fs.existsSync(curPath))
                                            {
                                                curPath = "./images/logo-arduino.png"
                                            }

                                            var sp3 = '<div class="kd-prj-container"><div id = "prj'+examples[j].sub[k].sub[c].sub[t].dir+'" class = "kd-prj-button"><a><img src = "' + curPath + '" width="165px" height="165px"/></a></div><div class="kd-prj-title">'+examples[j].sub[k].sub[c].sub[t].dir+'</div></div>';

                                            $("#tagPrjs").append(sp3);

                                            var tag3 = $("#prj" + examples[j].sub[k].sub[c].sub[t].dir);

                                            tag3.click(function ()
                                            {
                                                var filename = String(this.id);

                                                filename = filename.substring(3, filename.length);

                                                for(let e = 0; e < examples[j].sub[k].sub[c].sub[t].sub.length; e++)
                                                {
                                                    var path = require('path');

                                                    // 获取文件的后缀名
                                                    var extname = path.extname(examples[j].sub[k].sub[c].sub[t].sub[e].file); 
                                                    
                                                    path = examplePath + examples[j].dir + "/" + examples[j].sub[k].dir + "/" + examples[j].sub[k].sub[c].dir + "/" + examples[j].sub[k].sub[c].sub[t].dir + "/" + examples[j].sub[k].sub[c].sub[t].sub[e].file;

                                                    if(extname == ".ino" || extname == ".py")
                                                    {
                                                        break;
                                                    }
                                                }

                                                let result = project.ifCreateWindow();

                                                    if(result == 0)
                                                    {
                                                        
                                                    }
                                                    else if(result == 1)
                                                    {
                                                        project.name = "";
                                                    }
                                                    else
                                                    {
                                                        return;
                                                    }

                                                // 创建项目
                                                project.openPrjSync(path);
                                            }); 
                                        }

                                        $("#tagPrjs").append("</div>");
                                    }
                                });
                            }

                            break;
                        }
                    }
                    
                    // 当点击第一级标签时自动点击第二级第一个标签
                    tag.tags[0].click();
                });

                // 初始化只运行一次
                createPrjFromExample = function(){};
            }

            // 展开默认选中的标签
            $("#tag" + examples[0].dir).click();

            $("#tag" + examples[0].dir).css("background-color", "#007ACC");
            $("#tag" + examples[0].dir).css("color", "#FFFFFF");
            $("#tag2" + examples[0].sub[0].dir).css("background-color", "#007ACC");
            $("#tag2" + examples[0].sub[0].dir).css("color", "#FFFFFF");
        }
    }
}

var tabsBar = 
{
    tabFile: Object(),
    tabBlock: Object(),
    tabCode: Object(),
    tabComm: Object(),
    tabUpload: Object(),

    contentFile: Object(),
    contentBlock: Object(),
    contentCode: Object(),
    contentComm: Object(),
    contentUpload: Object(),

    init: function () 
    {
        tabFile = $("#tabFile");
        tabBlock = $("#tabBlock");
        tabCode = $("#tabCode");
        tabComm = $("#tabComm");
        tabUpload = $("#tabUpload");

        this.tabFile = tabFile;
        this.tabBlock = tabBlock;
        this.tabCode = tabCode;
        this.tabComm = tabComm;
        this.tabUpload = tabUpload;

        contentFile = $("#contentFile");
        contentBlock = $("#contentBlock");
        contentCode = $("#contentCode");
        contentComm = $("#contentComm");
        contentUpload = $("#contentUpload");

        tabFile.content = contentFile;
        tabBlock.content = contentBlock;
        tabCode.content = contentCode;
        tabComm.content = contentComm;
        tabUpload.content = contentUpload;

        tabFile.content.menu = prjMenu;

        var tabBtns = new Array();

        tabBtns.push(tabFile);
        tabBtns.push(tabBlock);
        tabBtns.push(tabCode);
        tabBtns.push(tabComm);
        tabBtns.push(tabUpload);

        var contents = new Array();

        contents.push(tabFile.content);
        contents.push(tabBlock.content);
        contents.push(tabCode.content);
        contents.push(tabComm.content);
        contents.push(tabUpload.content);

        var updateTabs = function (tab) {
            contents.forEach(function (item) {
                item.hide();
            });

            tabFile.css("color", "#CCCCCC");

            // 处理鼠标经过时背景颜色更替
            tabBtns.forEach(function (item) {
                // 默认全部隐藏
                item.css("background-color", "#3C3C3C");
            });

            tab.css("background-color", "#1E1E1E");
        }

        tabCode.css("background-color", "#1E1E1E");

        tabCode.click(function () 
        {
            // 如果当前为积木模式
            if(project.mode == "BLOCK")
            {
                // 从积木获取代码
                var code = blockEditor.window.getCodeFromBlock('Arduino');

                codeEditor.window.editor.setValue(code);
            }

            updateTabs(tabCode);

            $("#contentCode").show();

            $("#footer-code").show();
            $("#footer-block").hide();
            $("#footer-comm").hide();
            $("#footer-upload").hide();
        });

        tabBlock.click(function () {
            updateTabs(tabBlock);

            $("#contentBlock").show();

            $("#footer-code").hide();
            $("#footer-block").show();
            $("#footer-comm").hide();
            $("#footer-upload").hide();
        });

        tabFile.click(function () {
            updateTabs(tabFile);

            $("#contentFile").show();
            //$("#tabFile").css("background-color", "#1E1E1E");

            tabFile.css("background-color", "#3C3C3C");
            //tabFile.css("color", "#3C3C3C");
            
            $("#contentFile").show();

            // 如果标签隐藏的则显示/否则隐藏　
            if(gui.titleBar.iconArea.is(':hidden'))
            {　　 
                gui.tabsBar.tabFile.css("background-color", "#1E1E1E");
                gui.tabsBar.tabCode.hide();
                gui.tabsBar.tabBlock.hide();
                gui.tabsBar.tabComm.hide();
                gui.tabsBar.tabUpload.hide();
                gui.tabsBar.tabFile.text("");
                gui.tabsBar.tabFile.css("background", "#1E1E1E url(./images/arrow.png) no-repeat center");
                footerBar.hide();
                gui.titleBar.iconArea.show();
            }
            else
            {
                gui.tabsBar.tabFile.text("项目");
                gui.tabsBar.tabFile.css("background", "");
                gui.tabsBar.tabCode.show();
                gui.tabsBar.tabComm.show();
                gui.tabsBar.tabUpload.show();

                if(project.mode == "BLOCK")
                {
                    // 显示积木标签
                    gui.tabsBar.tabBlock.show();
                }

                footerBar.show();
                
                gui.titleBar.iconArea.hide();
                
                gui.tabsBar.tabCode.click();
            }
        });

        tabComm.click(function () {
            updateTabs(tabComm);

            $("#contentComm").show();

            $("#footer-code").hide();
            $("#footer-block").hide();
            $("#footer-comm").show();
            $("#footer-upload").hide();
        });

        tabUpload.click(function () {
            updateTabs(tabUpload);

            $("#contentUpload").show();

            $("#footer-code").hide();
            $("#footer-block").hide();
            $("#footer-comm").hide();
            $("#footer-upload").show();

            // 更新串口设备列表
            device.getComDev();

            // 获取主控板信息
            arduino.getBoards();
        });
    }
}

var titleBar = 
{
    iconArea: Object(),
    titleTxt: String(),
    btnMin: Object(),
    btnMax: Object(),
    btnClose: Object(),

    init: function () 
    {
        iconArea = $("#iconArea");

        btnMin = $("#min");
        btnMax = $("#max");
        btnClose = $("#close");

        titleTxt = $("#titleTxt");

        this.iconArea = iconArea;
        this.btnMin = btnMin;
        this.btnMax = btnMax;
        this.btnClose = btnClose;
        this.titleTxt = titleTxt;
        this.iconArea.hide();

        // 点击最小化按钮
        this.btnMin.click(function () {
            // 发送最小化命令
            ipcRenderer.send('window-min');
        });

        // 鼠标经过最小化按钮
        this.btnMin.mouseover(function () {
            btnMin.attr("src", "./images/min-2.png");
        });

        // 鼠标离开最小化按钮
        this.btnMin.mouseleave(function () {
            btnMin.attr("src", "./images/min.png");
        });

        // 鼠标经过关闭按钮
        this.btnClose.mouseover(function () {
            btnClose.attr("src", "./images/close-2.png");
        });

        // 鼠标离开关闭按钮
        this.btnClose.mouseleave(function () {
            btnClose.attr("src", "./images/close.png");
        });

        // 鼠标点击关闭按钮
        this.btnClose.click(function () 
        {
            // 更新配置文件
            config.write();
            
            // 从积木更新代码
            if(project.mode == "BLOCK")
            {
                // XML内容有修改
                if(project.xml != blockEditor.window.getXmlFromBlock())
                {
                    let result = project.ifSavePrj(true);

                    if(result == 0)
                    {
                        // 先保存再关闭
                        project.savePrjSync(true);

                        // 关闭
                        ipcRenderer.send('window-close');
                    }
                    else if(result == 1)
                    {
                        // 不保存直接关闭
                        ipcRenderer.send('window-close');
                    }
                    else
                    {
                        // 取消
                        return;
                    }
                }
                else
                {
                    // 发送关闭命令
                    ipcRenderer.send('window-close');
                }
            }
            else if(project.mode == "CODE")
            {
                // 如果当前代码内容已经被修改
                if(codeEditor.window.getIsChange())
                {
                    let result = project.ifSavePrj(true);

                    if(result == 0)
                    {
                        // 先保存再关闭
                        project.savePrjSync();

                        // 关闭
                        ipcRenderer.send('window-close');
                    }
                    else if(result == 1)
                    {
                        // 不保存直接关闭
                        ipcRenderer.send('window-close');
                    }
                    else
                    {
                        // 取消
                        return;
                    }
                }
                else
                {
                    // 发送关闭命令
                    ipcRenderer.send('window-close');
                }
            }
            else
            {
                // 发送关闭命令
                ipcRenderer.send('window-close');
            }
        });

        // 鼠标点击最大化按钮
        this.btnMax.click(function () {
            // 发送最大化命令
            ipcRenderer.send('window-max');

            if (btnMax.attr("src") == './images/maxed.png') {
                btnMax.attr("src", "./images/max.png");
            } else {
                btnMax.attr("src", "./images/maxed.png");
            }
        });

        // 鼠标经过最大化按钮
        this.btnMax.mouseover(function () {
            if (btnMax.attr("src") == './images/maxed.png') {
                btnMax.attr("src", "./images/maxed-2.png");
            } else if (btnMax.attr("src") == './images/max.png') {
                btnMax.attr("src", "./images/max-2.png");
            }
        });

        // 鼠标离开最大化按钮
        this.btnMax.mouseleave(function () {
            if (btnMax.attr("src") == './images/maxed-2.png') {
                btnMax.attr("src", "./images/maxed.png");
            } else if (btnMax.attr("src") == './images/max-2.png') {
                btnMax.attr("src", "./images/max.png");
            }
        });
    }
}

// 下拉菜单效果 ---------------------------------------------------------

// 点击其他区域也关闭
$(document).click(function(e)
{
    if (!e.target.matches("button")) 
    {
        $("#dropdown-com").hide();
        $("#dropdown-board").hide();
    }
});

$("#listCom").click(function () 
{
    $("#dropdown-board").hide();
    $("#dropdown-com").show();
});

$("#listCom-2").click(function () 
{
    $("#dropdown-board").hide();
    $("#dropdown-com").show();
});

$("#listBoard").click(function () 
{
    $("#dropdown-com").hide();
    $("#dropdown-board").show();
});

$("#listBoard-2").click(function () 
{
    $("#dropdown-com").hide();
    $("#dropdown-board").show();
});

// 下拉菜单效果 ---------------------------------------------------------
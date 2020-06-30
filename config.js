var config = 
{
    fullScreen  : String(),
    recSize     : String(),
    width       : String(),
    height      : String(),
    lang        : String(),
    mode        : String(),
    type        : String(),
    fontSize    : String(),
    theme       : String(),
    board       : String(),
    lastPrjs    : String(),

    read: function () 
    {
        var jsonFile = require('jsonfile');
        var fileName = './config.json'

        let fs = require("fs");

        if(fs.existsSync(fileName))
        {
            var jsonData = jsonFile.readFileSync(fileName);

            config.fullScreen = jsonData.fullScreen;
            config.recSize    = jsonData.recSize;
            config.width      = jsonData.width;
            config.height     = jsonData.height;
            config.lang       = jsonData.lang;
            config.fontSize   = jsonData.fontSize;
            config.theme      = jsonData.theme;
            config.mode       = jsonData.mode;
            config.type       = jsonData.type;
            config.board      = jsonData.board;
            config.lastPrjs   = jsonData.lastPrjs;
        }
        else
        {
            // 配置文件不存在
        }
    },
    write: function()
    {
        let fs = require("fs");

        // json数组
        let data =
            {	
                "fullScreen":config.fullScreen,
                "recSize":config.recSize,
                "width":config.width,
                "height":config.height,
                "lang":config.lang,
                "mode":config.mode,
                "type":config.type,
                "fontSize":config.fontSize,
                "theme":config.theme,
                "board":config.board,
                "lastPrjs":config.lastPrjs,
            };

        // 数组转json字符串
        let jsonObj = JSON.stringify(data);

        // 把配置信息写入config文件
        fs.writeFileSync("./config.json", jsonObj);
    },
    update: function()
    {
        this.mode = 'none';
        this.type = 'none';

        config.write();
    },
    defult: function()
    {
        let fs = require("fs");

        // json数组
        let data =
            {	
                "fullScreen":"false",
                "recSize":"false",
                "width":"1188",
                "height":"766",
                "lang":"zh-cn",
                "mode":"none",
                "type":"none",
                "fontSize":"16",
                "theme":"vs-dark",
                "board":"Arduino UNO",
                "lastPrjs":"false",
            };

        // 数组转json字符串
        let jsonObj = JSON.stringify(data);

        // 把配置信息写入config文件
        fs.writeFileSync("./config.json",jsonObj);
    },
    writeTmp: function(path)
    {
        let fs = require("fs");

        // json数组
        let data =
        {	
            "mode":config.mode,
            "type":config.type,
            "path":"",
        };

        if(path)
        {
            data =
            {	
                "mode":config.mode,
                "type":config.type,
                "path":path,
            };
        }

        // 数组转json字符串
        let jsonObj = JSON.stringify(data);

        // 把配置信息写入config文件
        fs.writeFileSync("./tmp.json", jsonObj);
    },
    readTmp: function()
    {
        var jsonFile = require('jsonfile');
        var fileName = './tmp.json'

        let fs = require("fs");

        if(fs.existsSync(fileName))
        {
            var jsonData = jsonFile.readFileSync(fileName);

            project.mode = jsonData.mode;
            project.type = jsonData.type;
            project.path = jsonData.path;

            // 删除临时文件
            fs.unlinkSync(fileName);
        }
    },
    deleteTmp()
    {
        var fileName = './tmp.json'

        let fs = require("fs");

        if(fs.existsSync(fileName))
        {
            fs.unlinkSync(fileName);
        }   
    }
}
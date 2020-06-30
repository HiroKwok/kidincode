var comm = 
{
    cmd  : String(),
    serverProcess : Object(),

    init: function () 
    {
        childProcess = require('child_process');

        let rootPath = __dirname;

        // 判断当前系统类型
        if(kidin.os == 'win32')
        {
            // 如果是发布版
            if(kidin.isPublished == true)
            {
                rootPath = kidin.rootDir;
            }

            this.cmd = rootPath += "\\hardware\\windows\\comm\\run.bat";
        }
        else if(kidin.os == 'linux' || kidin.os == 'freebsd')
        {
            this.cmd = rootPath += "\\hardware\\linux\\comm\\";
        }
        else if(kidin.os == 'darwin')
        {
            this.cmd = rootPath += "\\hardware\\mac\\comm\\";
        }

        // 启动串口通讯服务器
        childProcess.exec(this.cmd);
    },

    kill: function () 
    {
        childProcess = require('child_process');

        let cmd = "";
        
        // 判断当前系统类型
        if(kidin.os == 'win32')
        {
            cmd = "taskkill /f /im webSerialTool.exe";
        }
        else if(kidin.os == 'linux' || kidin.os == 'freebsd')
        {
            cmd = "";
        }
        else if(kidin.os == 'darwin')
        {
            cmd = "";
        }

        debug.log(cmd);

        // 关闭服务器
        childProcess.exec(cmd);
    }

}

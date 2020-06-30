var device = {
    resetComDev: function (com) 
    {
        childProcess = require('child_process');

        var rootPath = __dirname;

        // 判断当前系统类型
        if(kidin.os == 'win32')
        {
            // 如果是发布版
            if(kidin.isPublished == true)
            {
                rootPath = kidin.rootDir;
            }

            rootPath += "/hardware/windows/python";
        }
        else if(kidin.os == 'linux' || kidin.os == 'freebsd')
        {
            rootPath += "/hardware/linux/python";
        }
        else if(kidin.os == 'darwin')
        {
            rootPath += "/hardware/mac/python";
        }

        var cmd = rootPath + "/python " + rootPath + "/kidin/serial_reset.py " + com;

        // 以比特率1200打开串口
        childProcess.exec(cmd);
    },
    getComDev: function () 
    {
        const exec = require('child_process').exec;

        const {
            remote
        } = require('electron');

        let tmpPath = remote.app.getPath('userData');

        var rootPath = __dirname;

        // 判断当前系统类型
        if(kidin.os == 'win32')
        {
            // 如果是发布版
            if(kidin.isPublished == true)
            {
                rootPath = kidin.rootDir;
            }

            rootPath += "/hardware/windows/python";
        }
        else if(kidin.os == 'linux' || kidin.os == 'freebsd')
        {
            rootPath += "/hardware/linux/python";
        }
        else if(kidin.os == 'darwin')
        {
            rootPath += "/hardware/mac/python";
        }

        var cmd = rootPath + "/python " + rootPath + "/kidin/serial_list.py";

        let cmdStr = cmd;
        let cmdPath = '';
        let workerProcess;

        runExec();

        function runExec() {
            // 执行命令行，如果命令不需要路径，或就是项目根目录，则不需要cwd参数：
            workerProcess = exec(cmdStr, {
                cwd: cmdPath
            })
            // 不受child_process默认的缓冲区大小的使用方法，没参数也要写上{}：workerProcess = exec(cmdStr, {})
            //workerProcess.stdout.setEncoding('utf8');
            // 打印正常的后台可执行程序输出
            workerProcess.stdout.on('data', function (data) {
                devices = new Array();

                $("#dropdown-com").empty();

                // 逐行拆分返回的控制台信息
                var index = data.indexOf('\n');

                while (index > -1) {
                    var line = data.substring(0, index);
                    data = data.substring(index + 1);

                    // 去除空格
                    line = line.replace(/(^\s*)|(\s*$)/g, "");

                    if (line == "disconnected") {
                        $("#listCom").attr('disabled', true);
                        $("#listCom-2").attr('disabled', true);

                        $("#listCom").text("未连接");

                        // 设置当前选中串口
                        arduino.com = "disconnected";
                    } else {
                        $("#listCom").attr('disabled', false);
                        $("#listCom-2").attr('disabled', false);

                        // 获取设备名称
                        var device = line.substring(0, line.indexOf('-'));

                        // 添加到设备列表
                        devices.push(device);

                        // 更新后选中最后的选项
                        $("#listCom").text(device);
                        arduino.com = device;

                        var item = $("<li><a href='#'>" + device + "</a></li>");

                        $("#dropdown-com").append(item);

                        item.click(function () {
                            // 设置当前选中串口
                            arduino.com = device;

                            // 更新下拉菜单信息
                            $("#listCom").text($(this).text());

                            // 隐藏下拉菜单
                            $("#dropdown-com").hide();
                        });
                    }

                    index = data.indexOf('\n');
                }
            });

            // 打印错误的后台可执行程序输出
            workerProcess.stderr.on('data', function (data) {
                console.log('stderr: ' + data);

            });

            // 退出之后的输出
            workerProcess.on('close', function (code) {
                console.log('out code：' + code);

            })
        }
    }
}
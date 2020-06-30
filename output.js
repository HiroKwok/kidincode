
function getDateMark()
{
    // 创建时间戳
    var mydate = new Date();

    var date = '[' + mydate.getFullYear() + '-' + (mydate.getMonth() + 1) + '-' + mydate.getDate() + ' ' + mydate.getHours() + ':' + mydate.getMinutes() + ':' + mydate.getSeconds() + ']';

    return date;
}

var output = 
{
    clear: function()
    {
        consoleEditor.window.clear();

        $("#progress").css("width", "0%");
    },
    addMessage: function(msg)
    {
        consoleEditor.window.addCode(msg);
    }
}
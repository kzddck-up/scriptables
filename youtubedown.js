/*
youtube下载小组件
作者：kzddck
微信公众号：kzddck
首次时间：2021.04.23
更新时间：2021.06.06
主要功能：下载youtube视频
更新内容：修复无法下载的错误
使用方法：
    
    下载功能：需要配合快捷指令进行完成，需安装此快捷指令！
    快捷指令：https://www.icloud.com/shortcuts/5f5b29677242493ca5601fdb3d32d146
    小组件功能：在选择小组件是，下面有个Parmeter参数，填写网络图片链接后，等待一会即可展示。
*/


async function geturl(url) {
    id = url.replace("https://youtu.be/", "")
    //拼接url
    newurl = `https://www.youtube.com/get_video_info?video_id=${id}&html5=1`,
    req = new Request(newurl)
    res = await req.loadString()
    re = /player_response=.+&enablecsi/
    datas = unescape(res.match(re)[0].replace('player_response=', '').replace('&enablecsi', '')).replace(/\\"/g, "'")
    //log(datas)
    playerResponse = JSON.parse(datas).streamingData.formats
    len = playerResponse.length - 1
    return { "code": "200", "msg": "成功", "data": { "downurl": [{ "url": playerResponse[len].url }] } }
}
async function getimg(url) {
    
        if(url== null){
     url = 'http://p6.itc.cn/images03/20200520/490c762cd4f3430786920e074180cc27.jpeg'
    req = new Request(url)
    img = await req.loadImage()
    return img
    }else{
        req = new Request(url)
    img = await req.loadImage()
    return img
    }
}

async function run(url) {
    try {
        var data = await geturl(url)
        Pasteboard.copy(JSON.stringify(data))
        const cb = new CallbackURL("shortcuts://x-callback-url/run-shortcut")
        cb.addParameter("name", "scriptable下载器")
        await cb.open()

    } catch {
        const n = new Notification()
        var data = await geturl(url)
        n.title = "下载失败，解析后的下载链接已复制，请借助其他第三方工具进行下载"
        n.schedule()
        Pasteboard.copy(JSON.stringify(data.data.downurl[0].url))
    }
}


//获取粘贴板
url = Pasteboard.paste()
imgurl = args.widgetParameter
fm = FileManager.local()
try {
    await run(url)
} catch {
    img = await getimg(imgurl)
    pic_cache_path = fm.joinPath(fm.documentsDirectory(), `youtube`)
    fm.writeImage(pic_cache_path, img)
    const widget = new ListWidget()
    widget.setPadding(0, 0, 0, 0)
    const info_stack = widget.addStack()
    info_stack.layoutVertically()
    info_stack.addSpacer()
    const name_stack = info_stack.addStack()
    info_stack.setPadding(10, 10, 5, 10)
    name_stack.addSpacer()
    widget.backgroundImage = img
    widget.presentSmall()
    Script.setWidget(widget)
    Script.complete()
}

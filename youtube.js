/*
youtube后台播放小组件
作者：kzddck
微信公众号：kzddck
首次时间：2021.04.23
更新时间：2021.05.19
主要功能：youtube视频后台播放，浮窗播放
修复无法后台播放，浮窗的bug
使用方法：
    关注微信公众号：kzddck获取
*/
    async function open(url){
  log(url)
id = url.replace("https://youtu.be/","")
//拼接url
newurl = `https://www.youtube.com/get_video_info?video_id=${id}&el=detailpage`,
req = new Request(newurl)
var cookie = Keychain.get("youtubecookieCase")
req.headers = {'cookie': cookie}
res = await req.loadString()
log(res)
re = /player_response=.+&enablecsi/
datas =unescape( res.match(re)[0].replace('player_response=', '').replace('&enablecsi', '')).replace(/\\"/g, "'")
//log(datas)
playerResponse = JSON.parse(datas).streamingData.formats
log(playerResponse)
len = playerResponse.length - 1
log(len)
Safari.open(playerResponse[len].url)
}
      
async function getimg(url) {
    if(url == null){
    var url = 'https://is3-ssl.mzstatic.com/image/thumb/Purple125/v4/84/1d/9a/841d9afa-769a-8355-5a67-3c846e6e8a92/logo_youtube_color-0-0-1x_U007emarketing-0-0-0-6-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/460x0w.png'
    }
    req = new Request(url)
    img = await req.loadImage()
    return img
}


//获取粘贴板
url = Pasteboard.paste()
imgurl = args.widgetParameter
fm = FileManager.local()
try {
    
    if (url.indexOf('youtu.be') > 0) {
      log(url)
        await open(url)

    } else {
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
} catch {
    const loginUrl = "https://accounts.google.com/signin/v2/identifier?service=youtube&uilel=3&passive=true&continue=https%3A%2F%2Fwww.youtube.com%2Fsignin%3Faction_handle_signin%3Dtrue%26app%3Ddesktop%26hl%3Dzh-CN%26next%3Dhttps%253A%252F%252Fwww.youtube.com%252F&hl=zh-CN&ec=65620&flowName=GlifWebSignIn&flowEntry=ServiceLogin";
        const webview = new WebView();
        await webview.loadURL(loginUrl);
        await webview.present();
        const req = new Request("https://www.instagram.com/")
        req.method = "get"
        const res = await req.loadString()
        const cookies = req.response.cookies
        var arr = ''
        //遍历cookie
        for (var i = 0; i < cookies.length; i++) {
            arr += cookies[i].name + "=" + cookies[i].value + ";"
        }
          //写入cookie缓存
        Keychain.set("youtubecookieCase", arr)
    }

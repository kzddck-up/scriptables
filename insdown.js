/*
ins下载小组件
作者：kzddck
微信公众号：kzddck
首次时间：2021.03.05
更新时间：2021.04.22
修复：组件图片不显示bug，移除回跳机制，移除更新检测
主要功能：下载ins所有的图片以及视频，小组件动态随机显示某用户的主页图片
使用方法：
    首次使用需要先进行登录
    
    下载功能：需要配合快捷指令进行完成，需安装此快捷指令！
    快捷指令：https://www.icloud.com/shortcuts/8e447af996654e39b6d57d0466fe4900
    
    小组件功能：在选择小组件是，下面有个Parmeter参数，填写后，等待一会即可展示。
*/

async function getdata() {
    try {
        //获取剪贴板
        var url = Pasteboard.paste()
        log(url)
        //判断这是哪里的链接（快拍和普通）

        //这里是快拍
        if (url.indexOf('instagram.com/s/') >= 0 || url.indexOf('instagram.com/stories/') >= 0) {
            req = new Request(url)
            html = await req.loadString()
            //判断是哪一种快拍
            if (url.indexOf('instagram.com/stories/') >= 0) {
                var reg = /(\[{"user":{"id":")([\s\S]*)[1-9a-zA-Z]*(profile_pic_url")/
                var id = html.match(reg)[0].replace('[{"user":{"id":"', '').replace('","profile_pic_url"', '')
            }
            else {
                var reg = /(https:\/\/www.instagram.com\/stories\/)([\s\S]*?)[1-9a-zA-Z]*(\/" \/>)/
                var id = "highlight:" + html.match(reg)[0].replace('/" />', '').replace('https://www.instagram.com/stories/highlights/', '')
            }
            //拼接查询api
            var newurl = "https://i.instagram.com/api/v1/feed/reels_media/?reel_ids=" + id
            var req = new Request(newurl)
            //标识符
            req.headers = { 'x-ig-app-id': '936619743392459' }
            var apiHtml = await req.loadString()
            var list = JSON.parse(apiHtml).reels[id].items
            var downurl = []
            //for循环downurl
            for (var i = 0; i < list.length; i++) {
                if (list[i].video_versions) {
                    var url = list[i].video_versions[0].url
                    downurl.push({ url: url })
                } else {
                    var url = list[i].image_versions2.candidates[0].url
                    downurl.push({ url: url })
                }
            } log(downurl)
            return {
                code: 200, data: { downurl: { url: downurl } }
            }
        } else {
            var req = new Request(url)
            var html = await req.loadString()
            //正则并转换为json
            var reg = /({"graphql":)([\s\S]*?)[1-9a-zA-Z]*(:{"edges":\[]}}}})/
            var data = JSON.parse(html.match(reg)[0].replace('\u0026', '&'))

            var downurl = data.graphql.shortcode_media

            //如果只有一个下载对象，则直接返回
            if (downurl.video_url) return { code: 200, data: { downurl: { url: { url: downurl.video_url } } } }
            //判断是一张图片还是多张图片
            var urllists = JSON.parse(html.match(reg)[0].replace('\u0026', '&')).graphql.shortcode_media
            if (urllists.edge_sidecar_to_children === undefined) {
                var downurl = urllists.display_url
                return { code: 200, data: { downurl: { url: { url: downurl } } } }
            } else {
                //多张图片
                var urlList = JSON.parse(html.match(reg)[0].replace('\u0026', '&')).graphql.shortcode_media.edge_sidecar_to_children.edges
                //判断是否存在多个视频
                var downurl = []
                for (var i = 0; i < urlList.length; i++) {
                    if (urlList[i].node.video_url) {
                        var url = urlList[i].node.video_url
                        downurl.push({ url: url })
                    } else {
                        var urls = urlList[i].node.display_resources
                        var urll = urls.length
                        downurl.push({ url: urls[urll - 1].src })
                    }
                }
            }
            return { code: 200, data: { downurl: { url: downurl } } }
        }
    } catch {
        //报错则说明为登录
        //登录ins，保存cookie
        const loginUrl = "https://www.instagram.com/accounts/login/";
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
        Keychain.set("cookieCase", arr)
    }
}
async function run() {
    try {
        var data = await getdata()
        //log(data)
        Pasteboard.copy(JSON.stringify(data))
        const cb = new CallbackURL("shortcuts://x-callback-url/run-shortcut")
        cb.addParameter("name", "ins下载器")
        await cb.open()
        Safari.open("instagram://")
    } catch {
        const n = new Notification()
        n.title = "请保证ins是正确的链接，不要包含中文"
        n.schedule()
    }
}
async function getimg(url) {
    if (url == null) {
        url = 'https://is5-ssl.mzstatic.com/image/thumb/Purple125/v4/4d/6e/da/4d6edaef-f2d7-53cf-b81a-e3e23375d4ee/Prod-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/460x0w.png'

    }
    req = new Request(url)
    img = await req.loadImage()
    return img
}


var url = Pasteboard.paste()
var imgurl = args.widgetParameter
var fm = FileManager.local()
try {
    if (url.indexOf('instagram.com') >= 0) {
        await run()
    } else {
        var img = await getimg(imgurl)
        let pic_cache_path = fm.joinPath(fm.documentsDirectory(), `insimages`)
        fm.writeImage(pic_cache_path, img)


        var img = fm.readImage(pic_cache_path)
    }
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
//await run()
catch {

    var fm = FileManager.local()
    var img = await getimg(imgurl)

    let pic_cache_path = fm.joinPath(fm.documentsDirectory(), `insimages`)
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

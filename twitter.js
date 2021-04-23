/*
推特下载小组件
作者：kzddck
微信公众号：kzddck
首次时间：2021.04.22
主要功能：下载推特的图片以及视频
使用方法：
    
    下载功能：需要配合快捷指令进行完成，需安装此快捷指令！
    快捷指令：https://www.icloud.com/shortcuts/5f5b29677242493ca5601fdb3d32d146
    
    小组件功能：在选择小组件是，下面有个Parmeter参数，填写网络图片链接后，等待一会即可展示。
*/

async function geturl(url) {
    //正则获取ID
    var reg = /status\/.+?s/
    var id = url.match(reg)[0].replace("status/", "").replace("?s", "")
    //拼接链接
    newurl = `https://twitter.com/i/api/2/rux.json?include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&skip_status=1&cards_platform=Web-12&include_cards=1&include_ext_alt_text=true&include_quote_count=true&include_reply_count=1&tweet_mode=extended&include_entities=true&include_user_entities=true&include_ext_media_color=true&include_ext_media_availability=true&send_error_codes=true&simple_quoted_tweet=true&count=20&refsrc_tweet=${id}&ext=mediaStats%2ChighlightedLabel`
    req = new Request(newurl)
    req.headers = {
        'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
        'x-csrf-token': '6b1630e1f241d254d9153f65b7f4964162f0dd82630fedc22a5b3296bb95921969dd2fb42c9a467bf2b946d1a29a2c2c80b539878f8292c67d0390d36a5b6c20ccc5c24e340576e20f09db0289dd5eed',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36',
        'cookie': 'personalization_id="v1_8UVOoVElzxPp9CuNtl/iSg=="; guest_id=v1%3A160448369085699039; _ga=GA1.2.421831687.1604483695; ads_prefs="HBIRAAA="; kdt=FtMUFMORvePD6YiNwXSOzScIiQ9MdlRlFyMPTHi7; remember_checked_on=1; auth_token=975bccf8a89e94c0380d1af0a7c74be8f371ae15; twid=u%3D854241868959203328; ct0=6b1630e1f241d254d9153f65b7f4964162f0dd82630fedc22a5b3296bb95921969dd2fb42c9a467bf2b946d1a29a2c2c80b539878f8292c67d0390d36a5b6c20ccc5c24e340576e20f09db0289dd5eed; external_referer=8e8t2xd8A2w%3D|0|S38otfNfzYt86Dak8Eqj76tqscUAnK6Lq4vYdCl5zxIvK6QAA8vRkA%3D%3D; lang=zh-cn; _gid=GA1.2.1842089217.1610347795',
    }
    //获取json
    html = await req.loadJSON()
    //拍断是否为视频,try为视频，url为图片
    try {
        downurl = html.globalObjects.tweets[id].extended_entities.media[0].video_info.variants[0].url
        return { "code": "200", "msg": "成功", "data": { "downurl": [{ "url": downurl }] } }
    }
    catch {
        //否则是图片
        data = html.globalObjects.tweets[id].entities.media
        var downurl = []
        for (var i = 0; i < data.length; i++) {
            url = data[i].media_url_https
            downurl.push({ "url": url })
        }
        log(downurl)
        return {
            "code": "200", "msg": "成功", "data": { downurl }
        }
    }
}
async function getimg(url) {
    if(url == null){
        log(url)
    var url = 'https://abs.twimg.com/responsive-web/client-web-legacy/icon-ios.b1fc7275.png'
    }
    req = new Request(url)
    img = await req.loadImage()
    return img
}
async function run(url) {
    try {
        log(url)
        var data = await geturl(url)
        Pasteboard.copy(JSON.stringify(data))
        const cb = new CallbackURL("shortcuts://x-callback-url/run-shortcut")
        cb.addParameter("name", "scriptable下载器")
        await cb.open()
    } catch {
        const n = new Notification()
        n.title = "下载失败，请保证是正确的链接"
        n.schedule()
    }
}
var url = Pasteboard.paste()
var imgurl = args.widgetParameter
var fm = FileManager.local()
try {
    if (url.indexOf('twitter.com') > 0) {
        await run(url)

    } else {
        var img = await getimg(imgurl)
        let pic_cache_path = fm.joinPath(fm.documentsDirectory(), `twitter`)
        fm.writeImage(pic_cache_path, img)
        const widget = new ListWidget()
        widget.setPadding(0, 0, 0, 0)
        const info_stack = widget.addStack()
        info_stack.layoutVertically()
        info_stack.addSpacer()
        const name_stack = info_stack.addStack()
        info_stack.setPadding(10, 10, 5, 10)
        name_stack.addSpacer()
        var image = img
        widget.backgroundImage = image
        widget.presentSmall()
        Script.setWidget(widget)
        Script.complete()
    }
} catch {
    var img = await getimg(imgurl)
        let pic_cache_path = fm.joinPath(fm.documentsDirectory(), `twitter`)
        fm.writeImage(pic_cache_path, img)
        const widget = new ListWidget()
        widget.setPadding(0, 0, 0, 0)
        const info_stack = widget.addStack()
        info_stack.layoutVertically()
        info_stack.addSpacer()
        const name_stack = info_stack.addStack()
        info_stack.setPadding(10, 10, 5, 10)
        name_stack.addSpacer()
        var image = img
        widget.backgroundImage = image
        widget.presentSmall()
        Script.setWidget(widget)
        Script.complete()
}

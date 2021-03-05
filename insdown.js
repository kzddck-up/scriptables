async function getdata(url) {
  try {
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
async function run(url) {
  try{
    var data = await getdata(url)
  //log(data)
  Pasteboard.copy(JSON.stringify(data))
  const cb = new CallbackURL("shortcuts://x-callback-url/run-shortcut")
  cb.addParameter("name", "不能")
  await cb.open()
  Safari.open("instagram://")
    }catch{
    const n = new Notification()
    n.title = "请保证ins是正确的链接，不要包含中文"
    n.schedule()
}
}
async function getimg() {
  var newurl = args.widgetParameter
  //var newurl = "https://instagram.com/yue_9.3?igshid=1pnnnkevtpy9"
  var req = new Request(newurl)
  log(Keychain.get("cookieCase"))
  req.headers = { "cooke": Keychain.get("cookieCase") }
  var html = await req.loadString()
  //正则
  var reg = /(window._sharedData = ).*[1-9a-zA-Z]*(;<\/script>)/
  var imagesUrl = JSON.parse(html.match(reg)[0].replace('window._sharedData = ', '').replace(';</script>', '')).entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges
  var imgUrl = []
  for (var i = 0; i < imagesUrl.length; i++) {
    imgUrl.push({ url: imagesUrl[i].node.thumbnail_src })
  }
  //随机数
  var rd = Math.ceil(Math.random() * (imgUrl.length))
  //返回随机链接
  return imgUrl[rd].url
}
//更新检测
async function update() {
    var url = 'http://jd.kzddck.cn/insupdata.json'
    let up = await new Request(url)
    var data = await up.loadJSON()
    if (data.up == 1) {
        console.log('无更新');
        return await render()
    } else {
        const n = new Notification()
        n.title = "有更新"
        n.body = "小组件有新的更新内容，请关注微信公众号：kzddck回复210305获取最新脚本！"
        n.schedule()
        return await render1()
    }
}
try{
var url = Pasteboard.paste()
if (url.indexOf('instagram.com') >= 0) {
  await run(url)
}
}catch{
var fm = FileManager.local() 
  let pic_cache_path = fm.joinPath(fm.documentsDirectory(), `imgCase`)
  try {
    await getimg()
    var url = await getimg()
    let req = await new Request(url)
    var img = await req.loadImage()
        fm.writeImage(pic_cache_path, img)
    // 图片写入缓存
//     fm.writeImage("imgCase", img)
  } catch {
    var img = fm.readImage(pic_cache_path)
  }
  const widget = new ListWidget()
  widget.setPadding(0, 0, 0, 0)
  const info_stack = widget.addStack()
  info_stack.layoutVertically()
  info_stack.addSpacer()
  const name_stack = info_stack.addStack()
  // padding
  info_stack.setPadding(10, 10, 5, 10)
  // 左对齐
  name_stack.addSpacer()
  var image = img
  widget.backgroundImage = image
//   widget.presentSmall()
  Script.setWidget(widget)
  Script.complete()
}

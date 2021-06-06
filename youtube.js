/*
youtube后台播放小组件
作者：kzddck
微信公众号：kzddck
首次时间：2021.04.23
更新时间：2021.06.06
主要功能：youtube视频后台播放，浮窗播放
修复无法后台播放，浮窗的bug,砍掉了登录功能（新接口不需要了）
使用方法：
    关注微信公众号：kzddck获取
*/
async function open(url){
  id = url.replace("https://youtu.be/","")
  //拼接url
  newurl = `https://www.youtube.com/get_video_info?video_id=${id}&html5=1`,
  req = new Request(newurl)
  res = await req.loadString()
  log("res"+res)
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
    await open(url)
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
  

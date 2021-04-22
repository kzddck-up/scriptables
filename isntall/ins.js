Script.Installer = async()=>{
//创建云盘文件
const Files = FileManager.iCloud();
//获取文件路径
const RootPath = Files.documentsDirectory();
let file = 'ins下载.js';
const filePath = `${RootPath}/${file}`;
const res = new Request(
  "https://raw.githubusercontent.com/kzddck-up/scriptables/main/insdown.js"
);
const content = await res.loadString();
if(content){
  Files.writeString(filePath, content);
  const n = new Notification()
        n.title = file+"安装成功"
        n.body = "小组件安装成功，请返回查看"
        n.schedule()
        const SELF_FILE = module.filename.replace(Script.name)
console.log(SELF_FILE)
Files.remove(SELF_FILE)
}else{
  const n = new Notification()
        n.title = file+"安装失败"
        n.body = "小组件安装失败，请重试"
        n.schedule()
}
}

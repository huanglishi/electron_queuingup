<template>
  <div id="app" @dblclick="doFullScreen">
     <div class="queuingup" >
          <div class="htitle">
            <div class="bgbox">
                疫苗接种排队系统
            </div>
        </div>
        <div class="head_title" v-if="pagedata.notice">
            <div class="nointetig" v-if="pagedata.notice">
                 {{pagedata.notice}}
            </div>
        </div>
        <!--数据表单-->
        <div class="numbox" ref="mainDiv" >
            <div class="left" >
                <div class="data_table" ref="mainLeft">
                    <table class="weui-table" >
                      <thead>
                        <tr :style="{height: (tableheiht/(pagedata.pagesize+1))+'px'}"><th>序号</th><th>呼叫号码</th><th>姓名</th><th>状态</th> </tr>
                      </thead>
                      <tbody >
                      <template v-for="(item,i) in pagedata.list">
                          <tr v-if="i<pagedata.pagesize" :key="'tl'+i" :style="{height: (tableheiht/(pagedata.pagesize+1))+'px'}">
                            <td title="序号" >{{i+1}}</td>
                            <td title="呼叫号码" class="tdnumber">{{item.number}}</td>
                            <td title="姓名" >{{item.name}}</td>
                            <td title="状态" style="overflow: hidden;">
                               <span :class="{span_status:item.status!=0,calling:item.status==1}" :style="{color:statusFontColor(item.status)}" >{{item.status|statusFont}}</span>
                            </td>
                          </tr>
                      </template>
                      <template v-for="(keys,i) in emtyCount(pagedata.pagesize,pagedata.list.length)">
                        <tr v-if="pagedata.list.length<pagedata.pagesize" :key="'l'+i"  :style="{height: (tableheiht/(pagedata.pagesize+1))+'px'}">
                          <td title="序号" >{{pagedata.list.length+i+1}}</td>
                          <td title="呼叫号码" > </td>
                          <td title="姓名" > </td>
                          <td title="状态" > </td>
                        </tr>
                    </template>
                    </tbody>
                </table>
              </div>

            </div>
            <div class="right"  >
                <div class="data_table" ref="mainRight">
                  <table class="weui-table" >
                    <thead>
                      <tr :style="{height: (tableheiht/(pagedata.pagesize+1))+'px'}"><th>序号</th><th>呼叫号码</th><th>姓名</th><th>状态</th> </tr>
                    </thead>
                    <tbody >
                    <template v-for="(item,i) in pagedata.list">
                        <tr v-if="i>=pagedata.pagesize" :key="'tr'+i" :style="{height: (tableheiht/(pagedata.pagesize+1))+'px'}">
                          <td title="序号" >{{i+1}}</td>
                          <td title="呼叫号码" class="tdnumber">{{item.number}}</td>
                          <td title="姓名" >{{item.name}}</td>
                         <td title="状态" style="overflow: hidden;">
                               <span :class="{span_status:item.status!=0,calling:item.status==1}" :style="{color:statusFontColor(item.status)}" >{{item.status|statusFont}}</span>
                            </td>
                        </tr>
                    </template>
                      <tr v-for="(keys,i) in (pagedata.pagesize-jsNum(pagedata.list.length,pagedata.pagesize))" :key="'r'+i" :style="{height: (tableheiht/(pagedata.pagesize+1))+'px'}">
                        <td title="序号" >{{rRum(pagedata.pagesize,pagedata.list.length)+i+1}}</td>
                        <td title="呼叫号码" > </td>
                        <td title="姓名" > </td>
                        <td title="状态" > </td>
                      </tr>
                  </tbody>
              </table>
              </div>

            </div>
        </div>
         <div class="footer" >
              <div class="left">
                信号状态：<span :class="{gr:communication=='正常',red:communication!='正常'}">{{communication}}</span>
                <a v-if="configMQTT_TOPIC">订阅信道：<span class="gr">{{configMQTT_TOPIC}}</span></a>
                </div>
              <div class="rigth" @click="testSpeech">
                <span class="date">{{clock.date}}</span> 
                <span class="time" >{{clock.time}}</span>
              </div>
          </div>
     </div>
  </div>
</template>
<script>
const path = require("path");
const fs = require("fs");
import {ipcRenderer } from 'electron'
import { getqueuingup } from './api/model'
import mqtt from 'mqtt'
var client
var calltext="到登记台准备";
export default {
  name: 'winApp',
  components: {
  },
  data(){
    return{
      pagedata:{list:[],notice:'',pagesize:15},
      timers:null,
      audiosrc:'',
      baseurl:'',
      communication:'',
      //时钟
      clock:{ time: '',date: ''},
      filepath:'',
      //配置
      configMQTT_TOPIC:"",
      //高度
      tableheiht:0,
    }
  },
  created(){
    //时钟
    setInterval(this.updateTime, 1000);
     this.communication="准备连接中..."
    if (process.env.NODE_ENV !== 'production'){
       const newFile_path = path.join(__resources, 'config/base.json').replace(/\\/g, "\/");
        this.filepath=__resources
         this.init(newFile_path)
    }else{
      //  console.log("生产环境：---");
        let _that=this;
        ipcRenderer.send('sendreplay') //对应主进程中的异步方法
        ipcRenderer.on('msg_main2render', (event, pathstr) => {
           let paths=pathstr.split("resources");
           let str_path=paths[0]+"resources"
            // console.log("系统目录：",str_path);
            _that.filepath=str_path
            const newFile_path = path.join(str_path, 'config/base.json').replace(/\\/g, "\/");
            _that.init(newFile_path)
        })
    }
  },
  mounted() {
    this.getDivHeight()
    window.addEventListener('resize', this.getDivHeight)
    setTimeout(()=>{
         ipcRenderer.send('doFullScreen')
          var mNotification = new Notification('操作提示', {
              body: "双击窗口退出全屏或点击“这里退出全屏”"
            })
          mNotification.onclick = () => {
            ipcRenderer.send('doFullScreen')
          }
    },1000)
  },
  destroyed() {
    window.removeEventListener('resize', this.getDivHeight, false)
  },
  methods:{
    //测试声音
    testSpeech(){
     this.startSpeech(93,"孟子琪")
    },
  /**
	 * 播报
	 * @param {Object} number 播放号
	 * @param {Object} name 播放姓名
	 */
	 startSpeech(number,name){
		const speech = new SpeechSynthesisUtterance()
		// 设置播放内容
		speech.text = "请"+number+"号"+name+calltext
		// 设置话语的音调(0-2 默认1，值越大越尖锐,越低越低沉)
		speech.pitch = 1
		// 设置说话的速度(0.1-10 默认1，值越大语速越快,越小语速越慢)
		speech.rate = 1
		// 设置说话的音量
		speech.volume = 100 
		// 设置播放语言
		speech.lang = 'zh-CN' 
		// 播放结束后调用
		speech.onend = (event)=>{
		}
		// 加入播放队列
    window.speechSynthesis.cancel();
		window.speechSynthesis.speak(speech)
	},
	
	/**
	 * 停止播报，停止所有播报队列里面的语音
	 */
	stopSpeech  () {
		window.speechSynthesis.cancel()
	},
    //双击全屏
    doFullScreen(){
        ipcRenderer.send('doFullScreen')
    },
    //计算分页
    jsNum(list,pagesize){
       if(list>pagesize){
          return list-pagesize;
       }else{
        return 0;
       }
    },
    //留空计算
    emtyCount(pagesize,list){
       if(pagesize>list){
          return pagesize-list;
       }else{
         return 0;
       }
    },
    rRum(pagesize,list){
       if(pagesize<list){
        let sx=list-pagesize;
          return pagesize+sx;
       }else if(list<=pagesize){
         return pagesize;
       }
    },
    getDivHeight() {
      const screenheight = window.innerHeight
      this.$refs.mainDiv.style.height = screenheight - 110 + 'px'
      this.$refs.mainLeft.style.height = screenheight - 130 + 'px'
      this.$refs.mainRight.style.height = screenheight - 130 + 'px'
      this.tableheiht=screenheight - 130
    },
    //初始化数据
    init(newFile_path){
      // console.log("路径：",newFile_path)
      let _that=this;
      fs.exists(newFile_path, function (exists) {
          if (exists) { 
              //读取本地的json文件
              var conf_data=fs.readFileSync(newFile_path, 'utf-8');
              let result = JSON.parse(conf_data);
              console.log("json文件2:",result)
              calltext=result.CALL_TEXT
              //设置文字大小
               let htmlDom = document.getElementsByTagName('html')[0];
                 htmlDom.style.fontSize = result.font_size+ 'px';
              _that.baseurl=result.base_url
              _that._getdata(result.base_url);
              if(!client){
                  _that.mqttMSG(result)
                }
          }else{
            this.communication="找不到附件目录："+newFile_path
          }
      });
    },
    //mqtt监听
    mqttMSG(siteconfig) {
       this.configMQTT_TOPIC=siteconfig.MQTT_TOPIC
       this.communication="通信正在链接中..."
       const options = {
          connectTimeout: 40000,
          clientId: 'client_'+siteconfig.MQTT_TOPIC,
          username: siteconfig.MQTT_USERNAME,
          password: siteconfig.MQTT_PASSWORD,
          clean: true
      }
      client = mqtt.connect(siteconfig.MQTT_SERVICE, options)
      // mqtt连接
      client.on('connect', (e) => {
        // console.log('连接成功:')
         this.communication="通信连接成功，准备订阅中..."
        client.subscribe(siteconfig.MQTT_TOPIC, { qos: 1 }, (error) => {
          if (!error) {
            this.communication="正常"
            // console.log(siteconfig.MQTT_TOPIC+'订阅成功')
          } else {
            this.communication="通信连接成功，订阅失败..."
            // console.log(siteconfig.MQTT_TOPIC+'订阅失败')
          }
        })
      })
      let _that=this;
      // 接收消息处理
      client.on('message', (topic, message) => {
        let rsp=JSON.parse(message.toString())
        // console.log(" 接收消息:",rsp)
        if(rsp&&rsp.type=="one"){//第一次呼叫并刷新数据
             if(rsp.number>0){
                // _that.playvoice(rsp.number)
                 _that.startSpeech(rsp.number,rsp.uname)
             }
             _that._getdata(_that.baseurl);
        }else if(rsp&&rsp.type=="again"){//重新呼叫
         if(rsp.number>0){
            // _that.playvoice(rsp.number)
            _that.startSpeech(rsp.number,rsp.uname)
          }
        }else if(rsp&&rsp.type=="updata"){//刷新数据
            _that._getdata(_that.baseurl);
        }
        // console.log("订阅到数据：",rsp)
        // console.log("订阅到主题：",topic)
      })
    },
    //获取数据
    _getdata(burl){
          getqueuingup({base:burl}).then(res => {
              if(res.code==1){
                this.pagedata=res.data
                var myfontsize=res.data.fontsize
                if(res.data.calltext){
                   calltext=res.data.calltext
                }
                if(myfontsize){
                    var hts = document.getElementsByTagName('th');
                    for(var index in hts){
                      if(hts[index].style){
                        hts[index].style.fontSize = myfontsize+'px';
                      }
                    }
                    this.$nextTick(()=>{
                      var tds = document.getElementsByTagName('td');
                      for(var index in tds){
                        if(tds[index].style){
                          tds[index].style.fontSize = myfontsize+'px';
                        }
                      }
                    })
                }
              }
          }).catch(err => {
             const myNotification = new Notification('网络错误', {
                body: `网络似乎开小差了，请稍后再试: ${err.message}`
              })
              myNotification.onclick = () => {
                // console.log('通知被点击')
              }
          }).finally(()=>{
          })
    },
    play_qing(num){
      const audio_path = path.join(this.filepath, 'voice/qing.mp3').replace(/\\/g, "\/");
      const audio_buf = fs.readFileSync(audio_path);//读取文件，并将缓存区进行转换
      const uint8Buffer = Uint8Array.from(audio_buf);
      const bolb= new Blob([uint8Buffer]);//转为一个新的Blob文件流
       let _that=this
       this.vnum(bolb,(audio)=>{
         audio.addEventListener('ended', function () {  
            _that.play_num(num)
        }, false);
       })
    },
   play_end(){
      const audio_path = path.join(this.filepath, 'voice/end.mp3').replace(/\\/g, "\/");
      const audio_buf = fs.readFileSync(audio_path);//读取文件，并将缓存区进行转换
      const audio_uint8Buffer = Uint8Array.from(audio_buf);
      const audio_bolb= new Blob([audio_uint8Buffer]);//转为一个新的Blob文件流
       this.vnum(audio_bolb,(audio)=>{
           audio.addEventListener('ended', function () {  
           }, false);
       })
    },
    vnum(audio_bolb,funback){
       let audio = new Audio()
       audio.src = window.URL.createObjectURL(audio_bolb); //转换为url地址并直接给到audio
       audio.play();
       funback(audio)
    },
    //播放音频
    playvoice(num){
       this.$nextTick(()=>{
          this.play_qing(num)
       })
        // console.log("播放音频:开始");
    },
    play_num(num){
      let zn_ch=this.changeNumToHan(num);
      let rs = zn_ch.split("")
       let _that=this
       if(this.timers){
         clearTimeout( this.timers)
       }
      for(let index in rs){
          this.timers=setTimeout(function() {
               const g_path = path.join(_that.filepath, 'voice/'+_that.textToVoice(rs[index])+'.mp3').replace(/\\/g, "\/");
                const audio_buf = fs.readFileSync(g_path);//读取文件，并将缓存区进行转换
                const uint8Buffer = Uint8Array.from(audio_buf);
                const bolb= new Blob([uint8Buffer]);//转为一个新的Blob文件流
                _that.vnum(bolb,(audio)=>{
                  audio.addEventListener('ended', function () {  
                    if(index==rs.length-1){
                      _that.play_end()
                    }
                   }, false);
                })
          },  index==0?0:index*700);
      }
    },
    textToVoice(num){
       switch(num){
          case '零':
          return '0';
          case '一':
          return '1';
          case '二':
          return '2';
          case '三':
          return '3';
          case '四':
          return '4';
          case '五':
          return '5';
          case '六':
          return '6';
          case '七':
          return '7';
          case '八':
          return '8';
          case '九':
          return '9';
          case '十':
          return 'si';
          case '百':
          return 'bai';
          case '千':
          return 'qing';
          default:
           return '';
       }
    },
    changeNumToHan(num) {
      var arr1 = new Array('零', '一', '二', '三', '四', '五', '六', '七', '八', '九');
      var arr2 = new Array('', '十', '百', '千', '万', '十', '百', '千', '亿', '十', '百', '千','万', '十', '百', '千','亿');//可继续追加更高位转换值
            if(!num || isNaN(num)){
              return "零";
            }
        var english = num.toString().split("")
        var result = "";
        for (var i = 0; i < english.length; i++) {
          var des_i = english.length - 1 - i;//倒序排列设值
            result = arr2[i] + result;
            var arr1_index = english[des_i];
            result = arr1[arr1_index] + result;
        }
        //将【零千、零百】换成【零】 【十零】换成【十】
        result = result.replace(/零(千|百|十)/g, '零').replace(/十零/g, '十');
        //合并中间多个零为一个零
        result = result.replace(/零+/g, '零');
        //将【零亿】换成【亿】【零万】换成【万】
        result = result.replace(/零亿/g, '亿').replace(/零万/g, '万');
        //将【亿万】换成【亿】
        result = result.replace(/亿万/g, '亿');
        //移除末尾的零
        result = result.replace(/零+$/, '')
        //将【零一十】换成【零十】
        //result = result.replace(/零一十/g, '零十');//貌似正规读法是零一十
        //将【一十】换成【十】
        result = result.replace(/^一十/g, '十')
        return result;
    },
   //时钟
   updateTime() {
        var cd = new Date();
        var week = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
         this.clock.time = this.zeroPadding(cd.getHours(), 2) + ':' + this.zeroPadding(cd.getMinutes(), 2) + ':' + this.zeroPadding(cd.getSeconds(), 2);
         this.clock.date = this.zeroPadding(cd.getFullYear(), 4) + '年' + this.zeroPadding(cd.getMonth()+1, 2) + '月' + this.zeroPadding(cd.getDate(), 2) + '日 ' + week[cd.getDay()];
    },
    zeroPadding(num, digit) {
        var zero = '';
        for(var i = 0; i < digit; i++) {
            zero += '0';
        }
        return (zero + num).slice(-digit);
    },
    //状态颜色
    statusFontColor(val){
      if(val==0){
         return "#2c3e50"
      }else if(val==1){
          return "#1989fa"
      }else if(val==2){
          return "#07c160"
      }else if(val==3){
          return "#faad14"
      }else if(val==4){
          return "#faad14"
      }
    },
  },
  filters:{
    timestampToTime (timestamp) {
        if(!timestamp){
           return "---";
        }
       // 计算年月日时分的函数
       var date = new Date(timestamp*1000)
       var Y = date.getFullYear() + '年'
       var M = (date.getMonth() + 1) + '月'
       var D = date.getDate() + '日 '
       var h = date.getHours() + '时'
       var m = date.getMinutes()+ '分'
       return Y + M + D + h + m 
   },
   fromText(val){
      if(val==1){
         return "微信扫码取号"
      }else if(val==2){
          return "疫苗预约取号"
      }else if(val==3){
          return "医护代替取号"
      }
    },
    statusFont(val){
      if(val==0){
         return "排队中"
      }else if(val==1){
          return "呼叫中"
      }else if(val==2){
          return "体检中"
      }else if(val==3){
          return "已完成"
      }else if(val==4){
          return "未到站"
      }
    },
  }
}
</script>
<style lang="scss">
.calling{
   width: 2px;
    height: 2px;
  position: relative;
}
.calling::after{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 1px solid #1989fa;
    border-radius: 50%;
    -webkit-animation: antStatusProcessing 1.2s ease-in-out infinite;
    animation: antStatusProcessing 1.2s ease-in-out infinite;
    content: "";
}
@keyframes antStatusProcessing{0%{transform:scale(.8);opacity:.5}to{transform:scale(2.4);opacity:0}}
#app {
  // font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #09090a;
  margin: 0px;
  padding: 0px;
}

.queuingup{
  user-select: none;
  .head_title{
   .nointetig{
      text-align: left;
      background-color: #e6f7ff;
      border: 1px solid #91d5ff;
      padding: 8px 15px;
      font-size: 1rem;
   }
  }
 
  .data_table{
    .weui-table,table {
          width: 100%;
          border-collapse: collapse;
          line-height: 32px;
          text-align: center ;
          border:none;
      }

      .weui-table th,table th {
          font-weight: bolder;
      }
      .weui-table a,table a{
        color:#18B4ED;
      }
      .weui-table td, .weui-table th,table td, table th  {
          border:2px solid #289ad8;
          text-align: center;
          overflow: hidden;
          white-space:nowrap;
      }
     table thead th{
      }
     table tbody td{
         font-weight: 500;
         overflow: hidden;
      }
  }
  .footer{
      height: 40px;
      overflow: hidden;
      position:fixed;
      bottom:0;
      width: 100%;
      background-color: #e6f7ff;
      border: 1px solid #91d5ff;
       display: flex;
      align-items: center;     /* 垂直居中 */
      font-size: .9rem;
      .left{
       padding:2px 10px;
        flex: 1;
         border-right: 1px solid #91d5ff;
         .gr{
            color: #1890ff;
         }
         .red{
           color: red;
         }
         a{
           float: right;
         }
      }
      .rigth{
        flex: 1;
         padding: 2px 10px;
         .date{
           padding: 0px;
         }
         .time{
           padding-left: 10px;
           color: #1890ff;
         }
      }
  }
}
/********新 */
html,body{
      background: #289ad8;
      border: 0px;
      margin: 0px;
      width: 100%;
      height: 100%;
}
.htitle{
  height: 50px;
  width: 100%;
    display: flex;
     justify-content: center; /* 水平居中 */
  .bgbox{
    user-select: none;
    width: auto;
    height: 90%;
    background: #18b4ed;
    color: #fff;
    display: flex;
    align-items: center;     /* 垂直居中 */
    font-size: 28px;
    font-weight: 800;
    padding: 0px 50px;
    border-bottom-left-radius: 50px;
    border-bottom-right-radius: 50px;
    box-shadow: 0px 9px 0px #289ad8, 0px 9px 25px rgba(0, 0, 0, .7);
  }
}
.numbox{
  display: flex;
  .left{
    flex: 1;
    padding: 10px 5px 0px 10px;
  }
  .right{
    flex: 1;
     padding: 10px 10px 0px 5px;
  }
  .data_table{
    background-color: #fff;
    padding: 10px;
    border-radius: 10px;
     box-shadow: 2px 2px 3px rgba(0, 0, 0, .7);
     overflow: hidden;
  }
}
.tr{
  overflow: hidden;
}
.queuingup .data_table table tbody .tdnumber{
    font-weight: 700;
  }
.queuingup .data_table table tbody .span_status{
    font-weight: 550;
    
  }
</style>

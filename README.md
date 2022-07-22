# 社区卫生服务站接种疫苗叫号排队系统-大厅呼叫显示大屏应用 electron开发安装windows系统上

## 初始化项目
```
npm cache clear -f
npm install
```

### 运行
```
npm run electron:serve
```

### 打包
```
npm run electron:build 或者 yarn electron:build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

##软件安装：
消息通信使用mqtt
1.把base.json的MQTT_TOPIC（订阅主题）值替换成：queuingup_1或queuingup_2 注意每一个值只能配置一台。
2.CALL_TEXT默认呼叫内容，pc后台可以设置，后台为空则使用base.json的CALL_TEXT呼叫。
3.字体大小也是pc后台配置，pc后台为空才使用base.json的font_size配置。
### 呼叫声音在win7和win XP上（阉割版Win7/XP无法正常使用TTS语音的解决办法）
最近在项目中用到了微软的TTS语音功能，但是在部分用户那里无法正常使用，经核查，是由于用户使用了阉割版的Win7和XP操作系统导致。一开始以为只需要安装相关的SDK就可以了，就在微软官方下载了各个版本的SDK尝试，都未解决问题。在网上继续查资料，查到上述两篇博客，中间还有其他曲折就不说了，结合两篇博文及其他一些资料，再经过自己的多次反复测试，按照以下方法可以解决问题：

1、由于只测试了部分阉割版Win7操作系统，而网上流传的阉割版操作系统阉割方式多种，阉割内容、程度、方式不尽相同，不确保每个阉割版都可以用该方法解决；强烈建议安装原版操作系统；

2、 XP阉割版系统未测试；

3、操作步骤：

    相关文件汇总下载：[http://pan.baidu.com/s/1pLUCvSv](下载文件地址)
  ```
    a、下载TTSrepair.exe安装，说明：该安装程序为第三方公司提供，已经过多次测试未发现病毒，是从上面第一篇博客下载的（最开始是从太平洋、霏凡软件等排名靠前的网站下载的，都带有病毒或捆绑了一些流氓软件，或自动安装了一些后台程序等，还好是用的虚拟机测试的），但该安装程序安装时会在安装程序所在文件夹生成两个文件，手动删除即可；

    b、根据不同的操作系统版本下载“SpeechPlatformRuntime(x64).msi”或“SpeechPlatformRuntime(x86).msi”安装；

    c、下载“MSSpeech_TTS_zh-CN_HuiHui.msi”进行安装；

    d、下载“voice.reg”覆盖注册表，该操作实际上就是使用上面第二篇博文中的“修改注册表”方法；
    
    简单的说：
第1步：双击“TTSrepair.exe”进行安装
第2步：双击“SpeechPlatformRuntime(x86).msi”进行安装
第3步：双击“MSSpeech_TTS_zh-CN_HuiHui.msi”进行安装
第4步：双击voice.reg”进行覆盖注册表
    
    ```

### 后台代码为PHP 框架为thinkphp5
有需要代码请联系微信taijidao101

## 效果-图片
呼叫内容为：请XX号张“到”，即为：固定内容和动态号数、姓名。
***
#呼叫大厅展示

![呼叫大厅展示](https://zy.linbint.com/common/uploadfile/getimage?url=resource/uploads/20220723/1658510006_show_img.jpg)
***
#呼叫操作台

![呼叫操作台](https://zy.linbint.com/common/uploadfile/getimage?url=resource/uploads/20220723/1658510140_do_img.jpg)


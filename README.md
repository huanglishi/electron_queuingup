# hsp_queuingup_plus

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

### 效果图片

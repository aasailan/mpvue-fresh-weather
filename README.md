# Mpvue 新鲜天气小程序

## 简介
1、该项目使用mpvue + typescript 重构了掘进小册的[*新鲜天气小程序项目*](https://github.com/ksky521/fresh-weather)，非常适合小程序学习以及mpvue框架的入门。  
2、项目脚手架基于mpvue官方的[*mpvue-ts-demo*](https://github.com/WingGao/mpvue-ts-demo)   
3、关于该项目的详细细节，完全可以参考掘金小册[*微信小程序开发入门：从 0 到 1 实现天气小程序*](https://juejin.im/book/5b70f101e51d456669381803/)

## 本地运行

``` bash
git clone https://github.com/aasailan/mpvue-fresh-weather.git

cd mpvue-fresh-weather

npm install

# 运行mpvue webpack
npm run dev

# 运行本地服务器，模拟云函数
npm run server
```

## 生产打包
``` bash
npm run build
```

## 需要注意的点
* mpvue官方ts脚手架demo的构建文件 build/webpack.prod.conf.js 中需要作出以下修改：
``` javascript
  // var UglifyJsPlugin = require('uglifyjs-webpack-plugin')
  var UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin')
```
* 原项目中针对云函数的mock部分，原封不动移植到了该项目，未做任何改动。
* 原生小程序中使用app.globalData来存储全局状态，该项目中改用vuex实现。
* 在mpvue中同样可以使用小程序插件，只需要注意事件绑定和数据绑定的语法改变即可。具体可以参见该项目内diary页面内的引用calendar插件。
* 该项目中小程序的type文件使用的是 @types/weixin-app 库，但是这个库写得比较糟糕。对于云开发这一块的type几乎空白。我自己参照腾讯文档做了许多补充，补充后的type文件放在 src/types/index.d.ts

## 如果觉得这个项目还不错，请给一个star ^^。如果遇到了什么问题，请开一个issue，我会尽快回复。



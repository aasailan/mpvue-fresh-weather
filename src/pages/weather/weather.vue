<template>
  <div class="wrapper weather-page" :style="{ background: 'url(' + backgroundImage + ') center -178rpx / 100% no-repeat ' +  backgroundColor }">
    <div class="navigator">
      <icon-a type="edit"></icon-a>
    </div>
    <div class="container" id="canvas-wrapper" :style="{paddingTop: paddingTop + 'px' }">
      <canvas canvas-id="effect" id="effect"></canvas>
      <div class="now">
        <!-- 所在地信息栏 -->
        <div class="location" @click="chooseLocation">
          <icon-a type="dingwei"></icon-a>
          <span>{{ address }}</span>
        </div>
        <!-- 空气质量 -->
        <div class="air-quality" v-if="air && air.aqi">
          <span class="circle" :style="{ background: air.color }"></span>
          <span class="value">{{ air.name }} {{ air.aqi }}</span>
        </div>
        <!-- 当前天气 -->
        <div class="now-weather">
          <div class="temp">
            <span class="text">{{ current.temp }}</span>
            <span class="text degree">°</span>
          </div>
          <div class="cur-weather">
            <div class="inline">
              <icon-a :type="current.icon"></icon-a>
              <span>{{ current.weather }}</span>
            </div>
            <div class="inline today">
              <span class="item">{{ humidity }}</span>
              <span class="item">{{ wind }}</span>
            </div>
          </div>
          <div class="tips" v-if="tips">
            <span>{{tips}}</span>
          </div>
        </div>
      </div>
      <!-- 今明两天天气模块 -->
      <div class="two-days">
        <div class="item">
          <div class="top">
            <span class="date">今天</span>
            <span class="temp">{{ today.temp }}</span>
          </div>
          <div class="bottom">
            <span>{{ today.weather }}</span>
            <!-- NOTE: 自定义组件：注意传参方式，需要在json文件中声明，icon本身会变成一个节点 -->
            <icon-a :type="today.icon"></icon-a>
          </div>
        </div>
        <div class="item">
          <div class="top">
            <span class="date">明天</span>
            <span class="temp">{{ tomorrow.temp }}</span>
          </div>
          <div class="bottom">
            <span>{{ tomorrow.weather }}</span>
            <icon-a :type="tomorrow.icon"></icon-a>
          </div>
        </div>
      </div>
    </div>
    <!-- 天气模块 -->
    <div class="weather" :style="{ backgroundColor: backgroundColor }">
      <!-- 一天内天气模块 -->
      <div class="container">
        <!-- 滚动容器需要由scroll-view实现，利用这个容器可以实现上拉滚动加载 -->
        <scroll-view scroll-x class="hourly">
          <div class="scrollX">
            <!-- NOTE: 注意wx:for的使用，注意添加wx:key -->
            <!-- 默认数组的当前项的下标变量名默认为 index，数组当前项的变量名默认为 item; 使用 wx:for-item 可以指定数组当前元素的变量名
              使用 wx:for-index 可以指定数组当前下标的变量名： -->
            <div class="item" v-for="(item, index) in hourlyData" :key="index">
              <!-- TODO: 将text转为p，测试一下 -->
              <p class="time">{{ item.time }}</p>
              <icon-a :type="item.icon"></icon-a>
              <p class="temp">{{item.temp}}°</p>
            </div>
          </div>
        </scroll-view>
      </div>
      <!-- 一周内天气模块 -->
      <div class="container">
        <div class="week">
          <div class="week-weather">
            <div class="item" v-for="(item, index) in weeklyData" :key="index">
              <div class="day">{{ item.formatDay }}</div> <!-- {{ utils.formatWeeklyDate(index) }} -->
              <div class="date">{{ item.formatDate }}</div> <!-- {{ utils.formatDate(item.time) }} -->
              <div class="daytime">
                <div class="wt">{{item.day}}</div>
                <icon-a :type="item.dayIcon"></icon-a>
              </div>
              <div class="night">
                <icon-a :type="item.nightIcon"></icon-a>
                <div class="wt">{{item.night}}</div>
              </div>
              <div class="wind">{{ item.formatNightWind }}</div> <!-- {{ utils.wind(item.nightWind) }} -->
              <div class="wind" v-if="item.nightWind">
                {{ item.formatNightWindLevel }}
              </div>
            </div>
          </div>
          <!-- 一周温度走势图 -->
          <div class="week-chart">
            <canvas canvas-id="chart" id="chart"></canvas>
          </div>
        </div>
      </div>
      <!-- 天气指数模块 -->
      <div class="container">
        <div class="life-style">
          <div class="item" v-for="(item, index) in lifeStyle" :key="index" 
            @click="indexDetail(item.name, item.detail)">
            <div class="title">
              <icon-a :type="item.icon"></icon-a>
              {{item.name}}
            </div>
            <div class="content">{{item.info}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
  @import "./weather.scss";
</style>
<style lang="scss">
.two-days {
  .item {
    .icon {
      float: right;
      font-size: 44rpx;
      height: 44rpx;
      width: 44rpx;
    }
  }
}
.hourly {
  .icon {
    font-size: 48rpx;
    margin: 20rpx auto 30rpx;
  }
}
.week {
  .week-weather {
    .icon {
      font-size: 38rpx;
      display: block;
      margin: 0 auto;
    }
  }
}
.life-style {
  .title {
    .icon {
      font-size: 24rpx;
      margin-right: 10rpx;
      margin-top: -2rpx;
    }
  }
}
</style>
<script lang="ts" src="./weather.ts">
</script>
<template>
  <div class="">
    <div class="navigator" @click="goBack">
      <icon-a type="back"></icon-a>
    </div>
    <!-- 日历组件 -->
    <div class="calendar">
      <calendar @dateChange="dateChange" weeks-type="full-en" cell-size="30" :next="false" 
        :prev="false" :show-more-days="true" calendar-style="demo6-calendar"
        header-style="calendar-header" board-style="calendar-board" :days-color="daysStyle" />
    </div>

    <div v-if="auth===0" class="auth-button">
      <button open-type="getUserInfo" bindgetuserinfo="getUserInfo">使用该功能需要授权登录</button>
    </div>
    <!-- 提交心情模态框 -->
    <div v-if="showPublish">
      <div class="publish" v-if="todayEmotion">
        <div class="title">
          <text>{{nickname}}, 你今天的心情是</text>
        </div>
        <div class="colors" >
          <div class="todayMood mood">
            <div :style="{ backgroundColor: colorEmotion }">
              <icon-a :type="todayEmotion" className="emoji"></icon-a> <!-- class="emoji" -->
            </div>
          </div>
        </div>
      </div>
      <div class="publish" v-if="!todayEmotion && lastMonth===curMonth">
        <div class="title">
          <text>{{nickname}}, 你今天是什么心情？</text>
        </div>
        <div class="colors" >
          <!-- 心情tag -->
          <div class="mood" v-for="(item, index) in emotions" :key="index">
            <div @click="checkedColor(item)" v-if="item === activeEmotion" :style="{ backgroundColor: colors[item] }">
              <icon-a :type="item" className="emoji"></icon-a> <!-- class="emoji" -->
              <icon-a type="checked2" className="checked"></icon-a> <!-- class="checked" -->
            </div>
            <div @click="checkedColor(item)" v-else :style="{ backgroundColor: colors[item] }">
              <icon-a :type="item" className="emoji"></icon-a> <!-- class="emoji" -->
            </div>
          </div>
        </div>
        <button @click="submitEmotion">提交心情</button>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
@import './diary.scss';
</style>
<style lang="scss">
.colors {
  .mood view {
    .emoji{
      color: black;
      padding: 12rpx;
      font-size: 68rpx;
      // text-align: center;
    }
    .checked {
      font-size: 42rpx;
      color: #09bb07;
      position: absolute;
      right: -4rpx;
      top: -4rpx;
    }
  }
}
</style>
<script lang="ts" src="./diary.ts">
</script>
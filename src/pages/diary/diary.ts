/*
 * @Author: qiao 
 * @Date: 2018-10-08 19:01:48 
 * @Last Modified by: qiao
 * @Last Modified time: 2018-10-08 20:21:12
 * 日历
 */

import { Vue, Component } from 'vue-property-decorator';
import IconA from '@/components/icon/icon.vue';
import { dateFormat } from '@/util';
import { jscode2session, getEmotionByOpenidAndDate, addEmotion } from '@/api/api';
import store, { IDiaryData } from '@/store';
import { Mutation, State } from 'vuex-class';
import { SAVE_DIARY_DATA, SAVE_NICKNAME, SAVE_AVATAR } from '@/store/types';

interface IDayStyle {
  month: string;
  day: number;
  color: string;
  background: string;
}

@Component({
  components: {
    IconA
  },
  store
})
export default class DiaryComp extends Vue {

  @State(state => state.avatarUrl)
  avatarUrl: string;

  @State(state => state.nickname)
  nickname: string;

  auth: number = -1;
  openid: string = '';

  curMonth: string = '';
  daysStyle: IDayStyle[] = [];
  todayEmotion: string = 'serene';
  activeEmotion: string = 'serene';
  emotions = ['serene', 'hehe', 'ecstatic', 'sad', 'terrified'];
  colors = {
    serene: '#64d9fe',
    hehe: '#d3fc1e',
    ecstatic: '#f7dc0e',
    sad: '#ec238a',
    terrified: '#ee1aea'
  };
  showPublish = false;
  lastMonth = '';

  @Mutation(SAVE_DIARY_DATA)
  saveDiaryData;
  
  @Mutation(SAVE_NICKNAME)
  saveNickName;

  @Mutation(SAVE_AVATAR)
  saveAvatarUrl;

  get colorEmotion() {
    return this.colors[this.todayEmotion];
  } 

  async onLoad() {
    this.curMonth = dateFormat(new Date(), 'yyyy-MM');
    // 获取用户授权
    try {
      await this.getScope();
      this.getUserInfo();
    } catch (e) {
      this.auth = 0;
    }
  }

  // 获取用户信息
  async getUserInfo() {
    if (!this.nickname || !this.avatarUrl) {
      this._getUserInfo().then(res => {
        const userInfo = res.userInfo;
        this.saveNickName(userInfo.nickName);
        this.saveAvatarUrl(userInfo.avatarUrl);
      });
    }
    
    let openid = wx.getStorageSync('openid');
    console.log('openid:' + openid);
    if (openid) {
      this.setDate(openid);
    } else {
      try {
        const res = await this.getUserOpenId();
        openid = res.result.openid;
        this.setDate(openid);
      } catch (e) {
        this.auth = 0;
      }
    }
  }

  setDate(openid: string) {
    this.auth = 1;
    this.openid = openid;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const data: IDiaryData[] = this.$store.state.diary[`diary-${year}-${month}`] || [];
    if (data && data.length) {
      // 当前月份，存在缓存
      console.log('setDate');
      this._setDayData(data, year, month);
    } else {
      this.setCalendarColor();
    }
  }

  // 设置日历颜色
  async setCalendarColor(year: number = new Date().getFullYear(), month: number = new Date().getMonth() + 1) {
    // 获取心情数据
    try {
      const res = await getEmotionByOpenidAndDate(this.openid, year, month);
      const data = res.data || [];
      this.saveDiaryData({
        key: `diary-${year}-${month}`,
        data
      });
      this._setDayData(data, year, month);
    } catch (e) {
      wx.showToast({
        title: '加载已签数据失败，请稍后再试',
        icon: undefined,
        duration: 3000
      });
    } 
  }

  _setDayData(data: IDiaryData[], year, month) {
    const colors = this.colors;
    
    const styles: any[] = [];
    const now = new Date();
    const today = dateFormat(now);
    let todayEmotion = '';
    console.log('_setDayData');
    data.forEach((v) => {
      let ts = v.tsModified;
      let date = new Date(ts);
      let day = date.getDate();
      if (today === dateFormat(date)) {
        todayEmotion = v.emotion || '';
      }
      styles.push({
        month: 'current',
        day,
        color: 'black',
        background: colors[v.emotion]
      });
    });
    console.log('daysStyle: ' + this.daysStyle);
    this.showPublish = true;
    this.lastMonth = `${year}-${('00' + month).slice(-2)}`;
    this.todayEmotion = todayEmotion;
    this.daysStyle = styles;
  }

  // 微信登录，获取用户登录信息
  getUserOpenId() {
    return new Promise<{ result: any }>((resolve, reject) => {
      wx.login({
        success: res => {
          jscode2session(res.code).then(res => {
            let { openid = '', session_key = '' } = res.result || {};
            if (openid && session_key) {
              wx.setStorage({
                key: 'openid',
                data: openid
              });
              resolve(res);
            } else {
              reject();
            }
          });
        }
      });
    });
  }

  // 获取用户信息
  _getUserInfo() {
    return new Promise<wx.UserInfoResponse>((resolve, reject) => {
      wx.getUserInfo({
        success: res => {
          // console.log(res);
          resolve(res);
        }
      });
    });
  }

  // 获取用户授权
  getScope(name = 'scope.userInfo') {
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success: res => {
          if (res.authSetting[name]) {
            resolve(res);
          } else {
            reject();
          }
        }
      });
    });
  }

  goBack() {
    wx.navigateBack();
  }

  // 选择心情
  checkedColor(item: string) {
    this.activeEmotion = item;
  }

  // 提交心情
  async submitEmotion() {
    try {
      const res = await addEmotion(this.openid, this.activeEmotion);
      if (res._id) {
        let styles = this.daysStyle || [];
        let day = new Date().getDate();
        styles.push({
          month: 'current',
          day,
          color: 'black',
          background: this.colors[this.activeEmotion]
        });

        this.daysStyle = styles;
        this.todayEmotion = this.activeEmotion;
        
        // 将今天数据更新到globalData
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const data: IDiaryData[] = this.$store.state.diary[`diary-${year}-${month}`] || [];
        // const data: any[] = [];

        if (data.length) {
          data.push({
            openid: this.openid,
            emotion: this.activeEmotion,
            tsModified: Date.now()
          });
        }
      }
    } catch (e) {
      wx.showToast({
        title: '签到失败，请稍后再试',
        icon: undefined,
        duration: 3000
      });
    }
  }

  dateChange(e) {
    // console.log(e);
    // NOTE: mpvue对 小程序的事件做了封装，小程序的原事件对象在e.mp中
    let { currentYear, currentMonth } = e.mp.detail;
    this.daysStyle = [];
    this.setCalendarColor(currentYear, currentMonth);
  }
}

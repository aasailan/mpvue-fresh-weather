/*
 * @Author: qiao 
 * @Date: 2018-10-06 15:55:57 
 * @Last Modified by: qiao
 * @Last Modified time: 2018-10-07 21:40:42
 * 天气页面组件
 */

import Vue from 'vue';
import Component from 'vue-class-component';
import { getWeather, getAir, getMood, geocoder } from '@/api/api';
// import { Action } from 'vuex-class';
import * as utils from './wxs';

interface IWeeklyData {
  day: string;
  dayIcon: string;
  dayWind: string;
  dayWindLevel: string;
  maxTemp: string;
  minTemp: string;
  night: string;
  nightIcon: string;
  nightWind: string;
  nightWindLevel: string;
  time: number;
  [key: string]: any;
}

interface ILifeStyle {
  name: string;
  icon: string;
  info: string;
  detail: string;
}

@Component({})
export default class WeatherComp extends Vue {
  // 页面数据
  statusBarHeight = 32;
  backgroundImage = '../../images/cloud.jpg';
  backgroundColor = '#62aadc';
  paddingTop: number = 0;

  current = {
    temp: '0',
    weather: '数据获取中',
    humidity: '1',
    icon: 'xiaolian',
    wind: '',
    windLevel: ''
  };

  today = {
    temp: 'N/A',
    weather: '暂无'
  };
  tomorrow = {
    temp: 'N/A',
    weather: '暂无'
  };

  // hourlyData
  hourlyData = [];
  city = '北京';
  province = '';
  county = '';
  weeklyData: IWeeklyData[] = [];
  width = 375;
  scale = 1;
  address = '定位中';
  lat = 40.056974;
  lon = 116.307689;
  // 空气质量
  air = null;
  tips = '';
  oneWord = '';
  lifeStyle: ILifeStyle[] = [];

  get humidity() {
    return utils.humidity(this.current.humidity);
  }

  get wind() {
    return utils.wind(this.current.wind, this.current.windLevel);
  }

  // 针对WeeklyData进行处理
  get rendWeeklyData() {
    return this.weeklyData.map((item, index) => {
      item.formatDay = utils.formatWeeklyDate(index);
      item.formatDate = utils.formatDate(item.time);
      item.formatNightWind = utils.wind(item.nightWind);
      item.formatNightWindLevel = utils.windLevel(item.nightWindLevel);
      return item;
    });
  }

  async onLoad(query: any) {
    // 获取系统信息
    wx.getSystemInfo({
      success: (res) => {
        let width = res.windowWidth;
        let scale = width / 375;
        // console.log(scale * res.statusBarHeight*2+24)
        // 设置页面顶部显示细节
        this.width = width;
        this.scale = scale;
        this.paddingTop = res['statusBarHeight'] + 12;
      }
    });
    // 获取当前页面路由参数
    // const pages = getCurrentPages(); // 获取页面
    // const currentPage = pages[pages.length - 1];
    // const query = currentPage.
    if (query && query.address && query.lat && query.lon) {
      const { province, city, county, address, lat, lon } = query;
      this.city = city;
      this.province = province;
      this.county = county;
      this.address = address;
      this.lat = lat;
      this.lon = lon;
      await this.$nextTick();
      this.getWeatherData();
    } else {
       // 获取缓存数据
       this.setDataFromCache();
       // 获取地理位置信息
       this.getLocation();
    }
  }

  // 下拉刷新
  async onPullDownRefresh() {
    await this.getWeatherData();
    wx.stopPullDownRefresh();
  }

  // 从本地缓存获取数据
  setDataFromCache() {
    wx.getStorage({
      key: 'defaultData',
      success: ({ data }) => {
        if (data) {
          const { current, backgroundColor, backgroundImage, today, tomorrow, address, tips, hourlyData } = data;
          this.current = current;
          this.backgroundColor = backgroundColor;
          this.backgroundImage = backgroundImage;
          this.today = today;
          this.tomorrow = tomorrow;
          this.address = address;
          this.tips = tips;
          this.hourlyData = hourlyData;
        }
      }
    });
  }

  // 获取位置信息
  getLocation() {
    wx.getLocation({
      // 火星坐标
      type: 'gcj02',
      success: this.updateLocation,
      fail: e => this.openLocation()
    });
  }

  // 更新坐标信息
  updateLocation(res: wx.LocationData | wx.ChooseLocationData) {
    let { latitude: lat, longitude: lon } = res;
    this.lat = lat;
    this.lon = lon;
    // NOTE: 接口定义中没有name这个属性，下面这句估计可以去掉
    if (res['name']) {
      this.address = res['name'];
    }
    this.getAddress(lat, lon, res['name']);
  }

  // 提示未授权位置权限
  openLocation() {
    wx.showToast({
      title: '检测到您未授权使用位置权限，请先开启哦',
      // icon: 'none',
      duration: 3000
    });
  }

  // 获取地址
  async getAddress(lat: number, lon: number, name: string) {
    wx.showLoading({
      title: '定位中',
      mask: true
    });
    try {
      const res = await geocoder(this.lat, this.lon);
      
      let result = (res.data || {}).result;
      let { address, formatted_addresses, address_component } = result;
      if (formatted_addresses && (formatted_addresses.recommend || formatted_addresses.rough)) {
        address = formatted_addresses.recommend || formatted_addresses.rough;
      }
      let { province, city, district: county } = address_component;

      this.province = province;
      this.county = county;
      this.city = city;
      this.address = name || address;

    } catch (e) {
      this.address = name || '北京市海淀区西二旗北路';
    } finally {
      wx.hideLoading();
      this.getWeatherData();
    }
  }

  // 获取天气函数
  async getWeatherData() {
    wx.showLoading({
      title: '获取数据中',
      mask: true
    });

    try {
      const [weatherRes, airRes, moodRes] = await Promise.all([
        // 获取天气数据
        getWeather(this.lat, this.lon), 
        // 获取空气质量
        getAir(this.city),
        // 获取心情
        getMood(this.province, this.city, this.county)
      ]);

      wx.hideLoading();

      if (weatherRes && weatherRes.result) {
        this.renderFunc(weatherRes.result);
      }
      if (airRes && airRes.result) this.air = airRes.result;
      if (moodRes) {
        let result = (moodRes.data || {}).data;
        if (result && result.tips) {
          let tips = result.tips.observe || {};
          let index = Math.floor(Math.random() * Object.keys(tips).length);
          tips = tips[index] || null;
          // this.setData({tips})
          this.tips = tips;
        }
      }
    } catch (e) {
      console.log(e.message);
      wx.hideLoading();
      wx.showToast({
        title: '加载失败，请稍后再试',
        duration: 3000
      });
    }
  }

  // 渲染天气数据
  renderFunc(data) {
    const { hourly, daily, current, lifeStyle, oneWord = '', effect } = data;
    const { backgroundColor, backgroundImage } = current;
    const _today = daily[0];
    const _tomorrow = daily[1];

    const today = {
      temp: `${_today.minTemp}/${_today.maxTemp}°`,
      icon: _today.dayIcon,
      weather: _today.day
    };

    const tomorrow = {
      temp: `${_tomorrow.minTemp}/${_tomorrow.maxTemp}°`,
      icon: _tomorrow.dayIcon,
      weather: _tomorrow.day
    };

    this.today = today;
    this.tomorrow = tomorrow;
    this.hourlyData = hourly;
    this.weeklyData = daily;
    this.current = current;
    this.backgroundImage = backgroundImage;
    this.backgroundColor = backgroundColor;
    this.today = today;
    this.tomorrow = tomorrow;
    this.oneWord = oneWord;
    this.lifeStyle = lifeStyle;

    // TODO: 特效未加

    this.dataCache();
  }

  dataCache() {
    wx.setStorage({
      key: 'defaultData',
      data: {
        current: this.current,
        backgroundColor: this.backgroundColor,
        backgroundImage: this.backgroundImage,
        today: this.today,
        tomorrow: this.tomorrow,
        address: this.address,
        tips: this.tips,
        hourlyData: this.hourlyData
      }
    });
  }

  indexDetail(name: string, detail: string) {
    wx.showModal({
      title: name,
      content: detail,
      showCancel: false
    });
  }

  // TODO: 貌似选择位置后，不会变，需要测试 手动选择地理位置
  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        let { latitude, longitude } = res;
        if (latitude === this.lat && this.lon === longitude) {
          // 经纬度没变则直接更新天气
          this.getWeatherData();
        } else {
          // 经纬度变更，则更新地理位置信息
          this.updateLocation(res);
        }
      }
    });
  }
}

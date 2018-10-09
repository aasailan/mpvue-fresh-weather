/*
 * @Author: qiao 
 * @Date: 2018-10-06 20:07:42 
 * @Last Modified by:   qiao 
 * @Last Modified time: 2018-10-06 20:07:42 
 * api
 */

import { mockGetWeather, mockGetAir, mockJscode2session } from './api_mock';

// 腾讯地图的开发者账号
const QQ_MAP_KEY = 'ZWPBZ-EU2NO-UROW7-SHH54-3TBXO-XEFTN';

// 云函数环境
wx['cloud'].init({
  env: 'tianqi-789232'
});

const db = wx['cloud'].database();

let _getWeather;
let _getAir;
let _jscode2session;

if (process.env.NODE_ENV === 'development') {
  _getWeather = mockGetWeather;
  _getAir = mockGetAir;
  _jscode2session = mockJscode2session;
} else {
  _getWeather = (lat, lon) => {
    // 
  };
  _getAir = () => {
    //
  };
  _jscode2session = () => {
    //
  };
}

/**
 * 获取心情数据
 * @param {string} openid 
 * @param {number} year 需要获取的年
 * @param {number} month 需要获取的月份
 */
export const getEmotionByOpenidAndDate = (openid: string, year: number, month: number) => {
  const _ = db.command;

  const now = new Date();
  const curMonth = now.getMonth();
  const curYear = now.getFullYear();
  const curDay = now.getDate();
  let start = new Date(year, month - 1, 1).getTime();
  let end = new Date(year, month, 1).getTime();

  if (month - 1 === curMonth && curDay <= 20 && year === curYear) {
    // 如果是当前月份并且天数少于20，那么就一次取出
    return db
      .collection('diary')
      .where({
        openid,
        tsModified: _.gte(start).and(_.lt(end))
      })
      .get();
  }

  return new Promise((resolve, reject) => {
    Promise.all([
      db
        .collection('diary')
        .where({
          openid,
          tsModified: _.gte(start).and(_.lt(end))
        })
        .orderBy('tsModified', 'desc')
        .limit(15)
        .get(),
      db
        .collection('diary')
        .where({
          openid,
          tsModified: _.gte(start).and(_.lt(end))
        })
        .orderBy('tsModified', 'asc')
        .limit(16)
        .get()
    ]).then((data) => {
      let [data1, data2] = data;
      let set = new Set();
      data1 = data1.data || [];
      data2 = data2.data || [];
      data = data1.concat(data2).filter((v) => {
        if (set.has(v._id)) {
          return false;
        }
        set.add(v._id);
        return true;
      });
      resolve({ data });
    })
    .catch((e) => {
      reject(e);
    });
  });
};

/**
 * 添加心情
 * @param openid 
 * @param emotion 
 * @returns {Promise<any>}
 */
export const addEmotion = (openid: string, emotion: string) => {
  return db.collection('diary').add({
    data: {
      openid,
      emotion,
      tsModified: Date.now()
    }
  });
};

export const getMood = (province: string, city: string, county: string): Promise<wx.DataResponse> => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://wis.qq.com/weather/common',
      data: {
        source: 'wxa',
        weather_type: 'tips',
        province,
        city,
        county
      },
      success: (res) => resolve(res)
    });
  });
};

export const geocoder = (lat: number, lon: number): Promise<wx.DataResponse> => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/',
      data: {
        location: `${lat},${lon}`,
        key: QQ_MAP_KEY,
        get_poi: 0
      },
      success: res => resolve(res),
      fail: e => reject(e)
    });
  });
};

export const getWeather: (lat: number, lon: number) => Promise<{ result: any }> = _getWeather;
export const getAir: (city: string) => Promise<{ result: any }> = _getAir;
export const jscode2session: (code: string) => Promise<{ result: any }> = _jscode2session;

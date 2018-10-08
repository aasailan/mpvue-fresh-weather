/*
 * @Author: qiao 
 * @Date: 2018-10-06 20:07:42 
 * @Last Modified by:   qiao 
 * @Last Modified time: 2018-10-06 20:07:42 
 * api
 */

import { mockGetWeather, mockGetAir } from './api_mock';

// 腾讯地图的开发者账号
const QQ_MAP_KEY = 'ZWPBZ-EU2NO-UROW7-SHH54-3TBXO-XEFTN';

let _getWeather;
let _getAir;

if (process.env.NODE_ENV === 'development') {
  _getWeather = mockGetWeather;
  _getAir = mockGetAir;
} else {
  _getWeather = (lat, lon) => {
    // 
  };
  _getAir = () => {
    //
  };
}

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

/*
 * @Author: qiao 
 * @Date: 2018-10-06 20:07:31 
 * @Last Modified by: qiao
 * @Last Modified time: 2018-10-06 20:52:14
 * api mock
 */

export const mockGetWeather = (lat: number, lon: number) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'http://127.0.0.1:3000/api/he-weather',
      data: {
        lat,
        lon
      },
      success: res => resolve({ result: res.data }),
      fail: e => reject(e)
    });
  });
};

export const mockGetAir = (city: string) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'http://127.0.0.1:3000/api/he-air',
      data: { city },
      success: res => resolve({ result: res.data }),
      fail: e => reject(e)
    });
  });
};

export const mockJscode2session = (code: string) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'http://127.0.0.1:3000/api/jscode2session',
      data: {
        code
      },
      success: (res) => {
        resolve({ result: res.data });
      },
      fail: reject
    });
  });
};

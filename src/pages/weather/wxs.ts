/*
 * @Author: qiao 
 * @Date: 2018-10-07 20:13:37 
 * @Last Modified by:   qiao 
 * @Last Modified time: 2018-10-07 20:13:37 
 * 替代原来项目的index.wxs文件
 */

const WEEK_NAME = ['周一', '周二', '周三', '周四', '周五', '周六', '周日', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export function formatWeeklyDate(index: number) {
  const now = new Date();
  console.log('formatWeeklyDate');
  console.log(now);
  const names = ['今天', '明天', '后天'];
  if (names[index]) {
    return names[index];
  }
  const curWeek = now.getDay() - 1 + index;

  return WEEK_NAME[curWeek];
}

export function formatDate(ts: number) {
  const date = new Date(ts);
  const month = ('00' + (date.getMonth() + 1)).slice(-2);
  const day = ('00' + date.getDate()).slice(-2);
  return month + '/' + day;
}

export function wind(code: string, level?) {
  if (!code) {
    return '无风';
  }

  if (level) {
    level = level.toString().split('-');
    level = level[level.length - 1];
    return code + ' ' + level + '级';
  }
  return code;
}

export function windLevel(level: string) {
  if (level === '1-2') {
    return '微风';
  } else {
    return level + '级';
  }
}

export function humidity(h: string) {
  if (h) {
    return '湿度 ' + h + '%';
  }
  return h;
}

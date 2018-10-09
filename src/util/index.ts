/*
 * @Author: qiao 
 * @Date: 2018-10-08 19:42:16 
 * @Last Modified by:   qiao 
 * @Last Modified time: 2018-10-08 19:42:16 
 */

export function dateFormat(d: Date, pattern = 'yyyy-MM-dd') {
  let y = d.getFullYear().toString();
  let o = {
    M: d.getMonth() + 1, // month
    d: d.getDate(), // day
    h: d.getHours(), // hour
    m: d.getMinutes(), // minute
    s: d.getSeconds() // second
  };
  pattern = pattern.replace(/(y+)/gi, (a, b) => {
    return y.substr(4 - Math.min(4, b.length));
  });
  for (let i in o) {
    pattern = pattern.replace(new RegExp('(' + i + '+)', 'g'), function(a, b) {
      return o[i] < 10 && b.length > 1 ? '0' + o[i] : o[i];
    });
  }
  return pattern;
}

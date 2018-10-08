/*
 * @Author: qiao 
 * @Date: 2018-10-08 09:02:04 
 * @Last Modified by: qiao
 * @Last Modified time: 2018-10-08 10:46:21
 * 自定义组件
 */

import { Prop, Component, Vue } from 'vue-property-decorator';

@Component({})
export default class IconA extends Vue {

  @Prop({
    default: ''
  })
  type: string;

}

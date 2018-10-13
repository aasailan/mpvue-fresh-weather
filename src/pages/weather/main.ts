import Vue from 'vue';
import App from './weather.vue';

// console.log(App);
// console.log(App());
// const _app: any = App;
// const app = new Vue({
//   // store,
//   render: createVnode => {
//     const vnode = createVnode(App);
//     return vnode;
//   }
// });
const app = new Vue(App);
app.$mount();

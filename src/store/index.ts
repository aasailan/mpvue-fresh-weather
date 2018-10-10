/*
 * @Author: qiao 
 * @Date: 2018-10-09 21:53:16 
 * @Last Modified by: qiao
 * @Last Modified time: 2018-10-09 22:33:14
 * 全局状态
 */

import Vuex from 'vuex';
import { SAVE_DIARY_DATA, SAVE_NICKNAME, SAVE_AVATAR } from '@/store/types';
import Vue from 'vue';

Vue.use(Vuex as any);

export interface IDiaryData {
  emotion: string;
  openid: string;
  tsModified: number;
  _id?: string;
  _openid?: string;
}

export interface IRootState {
  diary: {
    [key: string]: IDiaryData[];
  };
  nickname: string;
  avatarUrl: string;
}

const store = new Vuex.Store<IRootState>({
  state: {
    diary: {},
    nickname: '',
    avatarUrl: ''
  },

  actions: {

  },

  mutations: {
    [SAVE_DIARY_DATA](state, diaryData: { key: string, data: IDiaryData[]}) {
      if (state.diary[diaryData.key]) {
        state.diary[diaryData.key] = diaryData.data;
      } else {
        Vue.set(state.diary, diaryData.key, diaryData.data);
      }
    },

    [SAVE_NICKNAME](state, nickname: string) {
      state.nickname = nickname;
    },

    [SAVE_AVATAR](state, avatarUrl: string) {
      state.avatarUrl = avatarUrl;
    }
  }
});

export default store;

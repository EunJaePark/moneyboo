import Vue from 'vue';
import Vuex from 'vuex';
import {
  getTotalGoal,
  getCashGoal,
  getCashAsset,
  getBanksCookieBank,
  getBanksCookieAsset,
  getBanksCookieId,
  getCategoryCookieName,
  getCategoryCookieIcon,
  getCategoryCookieId,
  getUserEmail,
  getUserUid,
  getUserNickname,
  getCurrentRouter,
  saveAuth,
} from '../utils/cookies.js';
import { loginUser } from '@/api/fireAuth';


Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    totalGoal: getTotalGoal() || '',
    cashGoal: getCashGoal() || '',
    cashAsset: getCashAsset() || '',
    bankAsset: {
      bank: getBanksCookieBank() || [],
      asset: getBanksCookieAsset() || [],
      id: getBanksCookieId() || [],
    },

    categorys: {
      name: getCategoryCookieName() || [],
      icon: getCategoryCookieIcon() || [],
      id: getCategoryCookieId() || [],
    },
    // 로그인/회원가입
    email: getUserEmail() || '',
    uid: getUserUid() || '',
    nickname: getUserNickname() || '',
    // 라우터
    currentRouter: getCurrentRouter() || '',
  },
  getters: {
    // 유저가 로그인 했는지 확인
    isLogin(state) {
      return state.email !== '';
    },
  },
  mutations: {
    // 로그인
    SET_USER(state, email) {
      state.email = email;
    },
    SET_UID(state, uid) {
      state.uid = uid;
    },
    SET_NICKNAME(state, nickname) {
      state.nickname = nickname;
    },
    // 로그아웃
    CLEAR_USER(state) {
      state.email = '';
    },
    CLEAR_UID(state) {
      state.uid = '';
    },
    // 라우터 경로
    SET_ROUTER_PATH(state, router) {
      state.currentRouter = router;
    },
  },
  actions: {
    // 로그인
    async FATCH_LOGIN({ commit }, data) {
      const response = await loginUser(data.email, data.password);
      // state 저장
      commit('SET_USER', response.user.email);
      commit('SET_UID', response.user.uid);
      commit('SET_NICKNAME', response.user.displayName);

      // 쿠키저장
      saveAuth('user_email', response.user.email);
      saveAuth('user_uid', response.user.uid);
      saveAuth('user_nickname', response.user.displayName);

      return response;
    },
  },
  modules: {},
});

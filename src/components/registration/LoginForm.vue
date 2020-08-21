<template>
  <!-- 로그인 페이지 -->
  <div class="regist-form login-form">
    <div class="regist-form-cont fade">
      <h3>로그인</h3>
      <form class="form" action="" @submit.prevent="submitForm">
        <!-- 아이디 -->
        <div :class="{ active: useremail }">
          <label for="useremail" v-if="!useremail">이메일</label>
          <input id="useremail" type="text" v-model="useremail" />
          <!-- 이메일 유효성 검사 메세지 -->
          <div class="logmessage-box">
            <p v-if="useremail && !emailCheck">
              가입된 이메일을 입력해주세요.
            </p>
          </div>
        </div>
        <!-- 비밀번호 -->
        <div :class="{ active: password }">
          <label for="password" v-if="!password">비밀번호</label>
          <input id="password" type="text" v-model="password" />
          <!-- 비밀번호 유효성 검사 메세지 -->
          <div class="logmessage-box">
            <p v-if="password && !passwordCheck">
              비밀번호를 입력해주세요.
            </p>
          </div>
        </div>
        <!-- 회원정보 까먹었을때 찾는 버튼 -->
        <!-- <p><a href="" class="font-jua">비밀번호 찾기</a></p> -->
        <button
          :class="{ active: loginSuccessBtn }"
          class="btn big login add-btn font-jua"
          :disabled="!userCompleted"
        >
          로그인
        </button>
      </form>
      <!-- 경고메세지 -->
      <p class="warning">{{ errMessage }}</p>
      <button class="reset-btn" @click.prevent="resetBtnForm()">
        되돌아가기
      </button>
    </div>
    <!-- 첫 화면 마스크 -->
    <a
      href=""
      class="mask mask-login fade"
      @mouseover="overLoginForm($event)"
      @click.prevent="clickSignupForm($event)"
      @mouseout="outLoginForm()"
    >
      <i class="mask-icon mask-login"></i>
      <strong class="font-jua mask-login">로그인</strong>
    </a>
  </div>
</template>
<script>
import {
  clickFormEvent,
  globalMountedInLogin,
  overFormEvent,
  resetFormEvent,
  outFormEvent,
  initRegistForm,
} from '@/js/registration.js';
import { passwordValidation, emailValidation } from '@/utils/validation';
import { moneybooRef } from '@/api/firestore';
import bus from '@/utils/bus';
export default {
  data() {
    return {
      // register
      useremail: '',
      password: '',
      // event
      errMessage: '',
      alertMessage: '',
    };
  },
  created() {},
  mounted() {
    // 이벤트 함수를 담당하는 js 함수에 element를 넘겨줘서 쉽게 dom을 제어할 수 있도록 함.
    globalMountedInLogin(this.$el);
  },
  computed: {
    // user가 입력됐는지 확인
    userCompleted() {
      return this.useremail && this.password;
    },
    // 이메일 유효성 검사
    emailCheck() {
      return emailValidation(this.useremail);
    },
    // 비밀번호 유효성 검사
    passwordCheck() {
      return passwordValidation(this.password);
    },
    // 조건이 성립하면 버튼 제출하도록 체크
    loginSuccessBtn() {
      return this.userCompleted && this.emailCheck && this.passwordCheck;
    },
  },
  methods: {
    // 로그인 양식 제출
    async submitForm() {
      this.errMessage = '';

      const userData = {
        email: this.useremail,
        password: this.password,
      };

      try {
        // 입력값, 유효성검사가 완료되면
        if (this.userCompleted && this.emailCheck && this.passwordCheck) {
          const response = await this.$store.dispatch('FATCH_LOGIN', userData);

          console.log(response);
          this.initForm();
          initRegistForm();
          this.errMessage = '';
          // settings에 데이터 확인하고 라우터 이동
          this.settingsRef(response.user.uid)
            .get()
            .then(doc => {
              // settings에 값이 있으면?
              if (doc.exists) {
                bus.$emit('start:spinner');
                setTimeout(() => {
                  this.$router.push('/main');
                }, 2500);
              } else {
                // settings에 값이 없으면?
                bus.$emit('start:spinner');
                setTimeout(() => {
                  this.$router.push('/setting');
                }, 2500);
              }
            });

          // 유효성 검사가 맞지않으면
        } else {
          // 에러메세지
          this.errMessage =
            !this.emailCheck && !this.passwordCheck
              ? '이메일과 비밀번호 형식이 맞지 않습니다.'
              : !this.emailCheck
              ? '이메일 형식이 맞지 않습니다.'
              : '비밀번호 형식이 맞지 않습니다.';
        }
      } catch (err) {
        console.log('로그인폼 에러다!!!', err);
        // 에러메세지
        this.errMessage =
          err.code === 'auth/user-not-found'
            ? '등록되지 않은 사용자입니다.'
            : err.code === 'auth/wrong-password'
            ? '비밀번호를 확인해주세요.'
            : '';
      }
    },
    // 클릭 이벤트
    clickSignupForm(event) {
      clickFormEvent(event.target);
    },
    // 폼 리셋
    initForm() {
      this.useremail = '';
      this.password = '';
    },
    // 마우스오버 이벤트
    overLoginForm(event) {
      overFormEvent(event.target);
    },
    // 리셋 버튼
    resetBtnForm() {
      resetFormEvent('login');
      this.initForm();
    },
    // 마우스 아웃 이벤트
    outLoginForm() {
      outFormEvent();
    },
    // settings DB
    settingsRef(uid) {
      return moneybooRef(uid).doc('settings');
    },
  },
};
</script>

<template>
  <!--회원가입 페이지  -->
  <div class="regist-form signup-form">
    <div class="regist-form-cont fade">
      <h3>회원가입</h3>
      <form class="form" action="" @submit.prevent="submitForm">
        <!-- 아이디 -->
        <div :class="{ active: useremail }">
          <label for="useremail" v-if="!useremail">이메일</label>
          <input id="useremail" type="text" v-model="useremail" />
          <!-- 이메일 유효성 검사 메세지 -->
          <div class="logmessage-box">
            <p v-if="useremail && !emailValidCheck">
              이메일 형식으로 입력해주세요.
            </p>
            <!-- 중복체크 -->
            <!-- <button
              @click="emailCheck()"
              class="font-jua"
              v-else-if="emailValidCheck"
            >
              중복체크
            </button> -->
          </div>
        </div>
        <!-- 닉네임 -->
        <div :class="{ active: nickname }">
          <label for="nickname" v-if="!nickname">닉네임</label>
          <input id="nickname" type="text" v-model="nickname" />
        </div>
        <!-- 비밀번호 -->
        <div :class="{ active: password }">
          <label for="password" v-if="!password">비밀번호</label>
          <input id="password" type="text" v-model="password" />
          <!-- 비밀번호 유효성 검사 메세지 -->
          <div class="logmessage-box">
            <p v-if="password && !passwordValidCheck">
              숫자 6자이상 입력해주세요.
            </p>
          </div>
        </div>
        <!-- 회원가입 버튼 -->
        <button
          :class="{ active: joinActiveBtn }"
          class="btn big signup add-btn font-jua"
          :disabled="!userCompleted"
        >
          가입
        </button>
      </form>
      <!-- 경고 메세지 -->
      <p class="warning" v-if="validlogMessage">{{ validlogMessage }}</p>
      <button class="reset-btn" @click.prevent="resetBtnForm()">
        되돌아가기
      </button>
    </div>
    <!-- 첫 화면 마스크 -->
    <a
      href=""
      class="mask mask-signup fade"
      @click.prevent="clickSignupForm($event)"
      @mouseover="overSignupForm($event)"
      @mouseout="outSignupForm($event)"
    >
      <i class="mask-icon mask-signup"></i>
      <strong class="font-jua mask-signup">회원가입</strong>
    </a>
  </div>
</template>
<script>
import { signupUser, userProfileUpdate } from '@/api/fireAuth';
import { moneybooRef } from '@/api/firestore';
import { dateFormat } from '@/utils/filters';
import { passwordValidation, emailValidation } from '@/utils/validation';
import {
  clickFormEvent,
  globalMountedInSingup,
  overFormEvent,
  resetFormEvent,
  outFormEvent,
  initRegistForm,
} from '@/js/registration.js';

export default {
  data() {
    return {
      // user info
      useremail: '',
      nickname: '',
      password: '',
      // log message
      validlogMessage: '',
    };
  },
  computed: {
    userCompleted() {
      return this.useremail && this.nickname && this.password;
    },
    emailValidCheck() {
      return emailValidation(this.useremail);
    },
    passwordValidCheck() {
      return passwordValidation(this.password);
    },
    joinActiveBtn() {
      return (
        this.userCompleted && this.emailValidCheck && this.passwordValidCheck
      );
    },
  },
  created() {},
  mounted() {
    // 이벤트 함수를 담당하는 js 함수에 element를 넘겨줘서 쉽게 dom을 제어할 수 있도록 함.
    globalMountedInSingup(this.$el);
  },
  methods: {
    // 회원가입 양식 제출
    async submitForm() {
      this.validlogMessage = '';
      // 1. 만약 유저가 있을 경우? 예외처리.. 중복체크
      // 3. 유저정보 저장 방법 다르게? xxx
      // 4. 회원가입이 완료되고 로그인,회원가입창 리셋시키기
      // 5. 회원탈퇴? 회원 삭제하면 db에서도 사라지게 구현하자.

      // 에러처리 어떤게 있을까..

      /*
        << 로그인 기능 순서 >>
        1. 로그인/회원가입 등록함 
        2. width,display 등 css를 리셋
        3. 팝업창 기다리는 동안 로딩바가 나옴 (로딩바 뒷배경은 아무것도 없도록?? 혹은 dimmed처리??)
        4. 팝업창
      */

      // 1. 이메일 중복체크,
      // 2. 비밀번호 유효성검사 vvv
      // 4. 에러처리

      try {
        // 유저정보가 입력되고 입력 형식이 맞는다면
        if (
          this.userCompleted &&
          this.emailValidCheck &&
          this.passwordValidCheck
        ) {
          const response = await signupUser(this.useremail, this.password);

          // 닉네임 등록
          userProfileUpdate(response, this.nickname);

          const userInfo = {
            createdAt: this.getDateFormat(new Date()),
            email: response.user.email,
            nickname: this.nickname,
          };

          // user 정보 DB에 등록
          this.userInfoSetting(response.user.uid, userInfo);

          console.log(response);

          this.validlogMessage = '';
          this.resetUserInfo();
          initRegistForm();
          alert('계정이 생성되었습니다! 로그인을 해주세요 🎉');

          // 입력값이 없고 유효성이 맞지않는다면
        } else {
          this.validlogMessage =
            !this.emailValidCheck && !this.passwordValidCheck
              ? '이메일과 비밀번호 형식이 맞지 않습니다.'
              : !this.emailValidCheck
              ? '이메일 형식이 맞지 않습니다.'
              : '비밀번호 형식이 맞지 않습니다.';
        }

        // 에러처리
      } catch (err) {
        console.log(err);
        this.validlogMessage =
          err.code === 'auth/email-already-in-use'
            ? '이미 사용 중인 이메일입니다. 다시 한번 확인해 주세요.'
            : '';
      }

      //this.resetUserInfo(); // input 값 리셋
    },
    emailCheck() {
      // const cred = firebaseApp.auth.EmailAuthProvider();
      // console.log(cred);
    },
    // 회원가입 페이지 클릭 이벤트
    clickSignupForm(event) {
      clickFormEvent(event.target);
    },
    // 마우스오버 이벤트
    overSignupForm(event) {
      overFormEvent(event.target);
    },
    // 리셋 버튼
    resetBtnForm() {
      resetFormEvent('signup');
      this.resetUserInfo();
    },
    // 마우스 아웃 이벤트
    outSignupForm(event) {
      outFormEvent(event);
    },
    // input 정보 리셋 함수
    resetUserInfo() {
      this.nickname = '';
      this.useremail = '';
      this.password = '';
    },
    getDateFormat(date) {
      return dateFormat(date);
    },
    userInfoSetting(uid, userData) {
      return moneybooRef(uid)
        .doc('userInfo')
        .set(userData);
    },
  },
};
</script>

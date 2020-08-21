<template>
  <div class="registration-page-wrap no-header">
    <LoginForm></LoginForm>
    <SignupForm></SignupForm>
  </div>
</template>

<script>
import LoginForm from '@/components/registration/LoginForm';
import SignupForm from '@/components/registration/SignupForm';
import { deleteCookie } from '@/utils/cookies';
import listMixins from '@/mixins/listMixins.js';
export default {
  components: {
    LoginForm,
    SignupForm,
  },
  mixins: [listMixins],
  created() {
    deleteCookie('cur_path');
  },
};
</script>

<style></style>

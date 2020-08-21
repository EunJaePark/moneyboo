<template>
  <!-- /main  -->
  <div class="asset-list-form">
    <form>
      <!-- 총자산 -->
      <div class="total-asset-cont">
        <strong>총 자산</strong>
        <b id="ani-money">{{ makeComma(assetTotal) }} 원</b>
      </div>
      <!-- 카드 -->
      <div class="credit-asset-cont">
        <em>카드</em>
        <ul>
          <li v-for="nInfo in bankArr" :key="nInfo.id">
            <span>{{ nInfo.bank }}</span>
            <b id="ani-money">{{ makeComma(nInfo.asset) }}원</b>
          </li>
        </ul>
      </div>
      <!-- 현금 -->
      <div class="cash-asset-cont">
        <em>현금</em>
        <b id="ani-money">{{ makeComma(cash) }} 원</b>
      </div>

      <button @click="addBtn" class="btn big main">추가</button>
    </form>
    {{ bankArr }}
  </div>
</template>

<script>
import { addComma } from '@/utils/filters.js';
import { moneybooRef } from '@/api/firebase';
// firebase를 사용하기 위해서 불러와야 한다.

export default {
  data() {
    return {
      assetTotal: '',
      bankArr: [],
      bankTotal: [],
      cash: '',
      currentUID: '',
    };
  },
  created() {
    this.currentUID = this.$store.state.uid; // 로그인한 유저 uid

    this.getSettingDB();
    // this.totalCalculate();
  },
  methods: {
    addBtn() {
      this.$router.push('/daily');
    },
    makeComma(val) {
      return addComma(val);
    },

    mBooRef() {
      return moneybooRef(this.currentUID);
    },
    getSettingDB() {
      this.mBooRef()
        .doc('settings')
        .get()
        .then(snapShot => {
          // console.log(snapShot.data().setAsset);
          // data값이 있을 경우.
          if (snapShot.exists) {
            const setAssetList = snapShot.data().setAsset;
            if (setAssetList) {
              const banks = [];
              setAssetList.banks.forEach(data => {
                banks.push(data);
                // this.totalCalculate(data.asset * 1);
              });
              this.bankArr = banks;

              // this.bankArr = setAssetList.banks;
              // console.log(this.bankArr);
              // [{…}, {…}, {…}, {…}, __ob__: Observer]
              // vue.js 에 구현되어 있는 ...observer를 붙여서 내부 변화를 감지하게 만들어둔 독자적인 array객체다.

              this.cash = setAssetList.cashAsset;
            }
          } else {
            // 값이 없을 경우
            alert(
              '관리 페이지에서 초기값을 입력해 주세요. 확인을 누르면 해당 페이지로 이동합니다.',
            );
            this.$router.push('/setting');
          }
        })
        .catch(err => {
          console.log('메인페이지 에러:', err);
        });
    },
    // 총 자산 계산
    totalCalculate() {
      let assets = this.bankArr;
      console.log(assets);
      // this.assetTotal = this.cash * 1 + totalBank;
      // console.log(this.bankArr);
    },
  },
};
</script>

<style></style>

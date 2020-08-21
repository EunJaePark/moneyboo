<template>
  <div class="set-asset">
    <!-- 1.목표금액 설정 2.각 자산들 설정 -->
    <h3 class="font-jua">목표 금액 설정 - 개인작업용</h3>
    <b class="explanation">* 모든 금액은 숫자만 기입해 주세요</b>
    <form action="">
      <div action="" class="total-goal-cont">
        <strong>총 목표 금액</strong>
        <input
          type="text"
          placeholder="총 목표 금액을 입력해 주세요"
          v-model="saveAsset.totalGoal"
        />
      </div>

      <div action="" class="money-goal-cont">
        <strong>현금 목표 금액</strong>
        <input
          type="text"
          placeholder="현금 목표 금액을 입력해 주세요"
          v-model="saveAsset.cashGoal"
        />
      </div>

      <div action="" class="money-asset-cont">
        <strong>현금 자산</strong>
        <input
          type="text"
          placeholder="현금 자산을 입력해 주세요"
          v-model="saveAsset.cashAsset"
        />
      </div>

      <div action="" class="credit-goal-cont">
        <strong>은행 별 자산 입력</strong>
        <!-- <b class="explanation" v-if="getBanks.length === 0">
          ( 우측 <span>+</span> 버튼을 눌러 은행 별 자산 입력창을 추가해 주세요.
          )
        </b> -->
        <b class="explanation" v-if="bankLength !== 0">
          <!-- 저장되어 있는 은행 개수를 불러와야 하기 때문에 firebase에 저장되어있는 banks의 length를 이용. -->
          ( 현재 {{ bankLength }}개의 은행 자산이 저장되어 있습니다.)
          <!-- ( 현재 {{ getBanks.length }}개의 은행 자산이 저장되어 있습니다.) -->
        </b>
        <button @click.prevent="clickAddBank()">+</button>
        <ul>
          <li class="explanationLi" v-if="saveAsset.banks.length === 0">
            <!-- 입력창이 하나라도 생성되면 안내글을 사라지게 해야하므로, saveAsset의 banks 길이를 이용 -->
            <span class="explanation">
              우측 <span>+</span> 버튼을 눌러 은행 별 자산 입력창을 추가해
              주세요.
            </span>
          </li>
          <li v-for="bankList in saveAsset.banks" :key="bankList.id">
            <select name="bank" v-model="bankList.bank">
              <option value="">은행선택</option>
              <option value="경남은행">경남은행</option>
              <option value="광주은행">광주은행</option>
              <option value="국민은행">국민은행</option>
              <option value="기업은행">기업은행</option>
              <option value="농협">농협</option>
              <option value="대구은행">대구은행</option>
              <option value="부산은행">부산은행</option>
              <option value="산업은행">산업은행</option>
              <option value="저축은행">저축은행</option>
              <option value="새마을금고">새마을금고</option>
              <option value="수협중항회">수협중항회</option>
              <option value="신협">신협</option>
              <option value="신한은행">신한은행</option>
              <option value="우리은행">우리은행</option>
              <option value="우체국">우체국</option>
              <option value="전북은행">전북은행</option>
              <option value="제주은행">제주은행</option>
              <option value="카카오뱅크">카카오뱅크</option>
              <option value="케이뱅크">케이뱅크</option>
              <option value="하나은행">하나은행</option>
              <option value="한국씨티은행">한국씨티은행</option>
              <option value="SC제일은행">SC제일은행</option>
            </select>
            <input
              type="text"
              placeholder="해당 은행의 총 목표 금액을 입력해 주세요"
              v-model="bankList.asset"
            />
            <!-- <button class="edit">수정</button> -->
            <button
              class="btn small remove"
              @click.prevent="clickRemoveBank(bankList)"
            >
              ✕
            </button>
          </li>
        </ul>
      </div>
      <button
        class="btn small"
        v-if="
          this.$store.state.total === '' &&
            this.$store.state.cash === '' &&
            this.$store.state.bankAsset.bank === '' &&
            this.$store.state.bankAsset.asset === 0
        "
        @click.prevent="clickSaveAsset()"
      >
        설정
      </button>
      <button
        class="btn small"
        v-if="
          this.$store.state.total !== '' ||
            this.$store.state.cash !== '' ||
            this.$store.state.bankAsset.bank !== '' ||
            this.$store.state.bankAsset.asset !== 0
        "
        @click.prevent="clickSaveAsset()"
      >
        수정
      </button>
    </form>
  </div>
</template>

<script>
import { makeID } from '@/utils/filters.js';
import { moneybooRef } from '@/api/firestore';

export default {
  data() {
    return {
      // '입력한 값', 'firebase에서 불러온 저장된 값' 모두 saveAsset 이용.
      saveAsset: {
        totalGoal: '',
        cashGoal: '',
        cashAsset: '',
        banks: [],
      },
      bankLength: 0, // 저장된 은행 개수 위해 필요.
      currentUid: this.$store.state.uid, // 현재 로그인한 유저의 uid
    };
  },
  created() {
    // ***********코드 연구중....**********
    console.log(this.saveAsset.banks);
    let saveAssetBank = this.saveAsset.banks;
    console.log(saveAssetBank);
    console.log(saveAssetBank.length);
    console.log(...this.saveAsset.banks);
    console.log(typeof this.saveAsset.banks);
    console.log(this.saveAsset.banks.length);
    console.log(JSON.parse(JSON.stringify(this.saveAsset.banks)));
    this.$root.log = function log() {
      for (let i = 0; i < saveAssetBank.length; i++) {
        console.log('hgello');
        console.log(saveAssetBank.length);
        if (typeof saveAssetBanks === 'object') {
          try {
            saveAssetBank[i] = JSON.parse(JSON.stringify(saveAssetBank));
          } catch (error) {
            console.log(error);
          }
        }
      }
      console.log(...saveAssetBank);
    };
    // ************************

    // 페이지 로딩 시 기본적으로 은행 별 자산 입력 칸 하나 생성시켜줌.
    if (this.saveAsset.banks === []) {
      this.saveAsset.banks.push({ bank: '', asset: '', id: '' });
    }

    // // cookie에 저장 된 은행 별 자산 불러옴.
    // for (let i = 0; i < this.$store.state.bankAsset.bank.length; i++) {
    //   // 1) cookie에 저장된 은행 수만큼 화면에 상자 생기게 해줌.
    //   this.saveAsset.banks.push({ bank: '', asset: '', id: '' });
    //   // 2) 은행명, 은행별 자산, 은행별 아이디 각각 넣어줌.
    //   this.saveAsset.banks[i].bank = this.$store.state.bankAsset.bank[i];
    //   this.saveAsset.banks[i].asset = this.$store.state.bankAsset.asset[i];
    //   this.saveAsset.banks[i].id = this.$store.state.bankAsset.id[i];
    //   console.log(this.$store.state.bankAsset.id[i]);
    // }

    // 저장된 은행 수 data에 넣어줌.
    this.bankNum = this.$store.state.bankAsset.bank.length;

    // firstore에서 asset DB 가져오기
    this.mbooRef()
      .doc('settings')
      .get()
      .then(docSnapshot => {
        // document의 값이 있으면
        if (docSnapshot.exists) {
          const setAsset = docSnapshot.data().setAsset;

          // setAsset 데이터가 있으면
          if (setAsset) {
            // 불러온 목표금액,현금자산 getAsset 객체에 저장
            this.saveAsset.totalGoal = setAsset.totalGoal;
            this.saveAsset.cashAsset = setAsset.cashAsset;
            this.saveAsset.cashGoal = setAsset.cashGoal;

            // 불러온 은행 자산들 getBanks에 저장
            setAsset.banks.forEach(data => {
              this.saveAsset.banks.push(data);
              this.getBanks.push(data);
            });

            // setAsset 데이터가 없으면
          } else {
            this.logMassage = '자산과 목표값을 입력해주세요!';
            console.log('setAsset 데이터가 없습니다!', docSnapshot);
          }

          // document 값이 없으면
        } else {
          console.log('settings 값이 없음', docSnapshot);
          this.logMassage = '셋팅 값을 입력해주세요!';
        }
      })
      .catch(err => {
        console.log(err);
      });

    // // 페이지 로딩 시 기본적으로 은행 별 자산 입력 칸 하나 생성시켜줌.
    // // if (this.saveAsset.banks === []) {
    // this.saveAsset.banks.push({ bank: '', asset: '', id: '' });
    // // }

    // firstore에서 asset DB 가져오기
    this.getFirebase();
  },
  computed: {},
  methods: {
    clickAddBank() {
      this.saveAsset.banks.push({ bank: '', asset: '', id: makeID('bank') });
    },
    clickRemoveBank(bankList) {
      this.banks.$remove(bankList);
    },
    mbooRef() {
      return moneybooRef(this.currentUid);
    },
    clickSaveAsset() {
      // // 총 목표 금액 저장
      // saveTotalGoal(this.saveAsset.totalGoal);
      // // 현금 목표 금액 저장
      // saveCashGoal(this.saveAsset.cashGoal);
      // // 현금 자산 저장
      // saveCashAsset(this.saveAsset.cashAsset);
      // // 은행 별 자산 저장(은행명+자산금액+id 묶어서)
      // saveBankAsset(this.saveAsset.banks);

      // firestore에 asset DB 저장
      this.mbooRef()
        .doc('settings')
        .get()
        .then(docSnapshot => {
          // documnet가 있으면 update
          if (docSnapshot.exists) {
            this.mbooRef()
              .doc('settings')
              .update({ setAsset: this.saveAsset });

            // document가 없으면 set
          } else {
            this.mbooRef()
              .doc('settings')
              .set({ setAsset: this.saveAsset });
            this.logMassage = ''; // 데이터를 추가했으니 logMessage 없애기
          }
        });
    },
    // created()에서 사용할 함수(추가, 수정, 삭제 된 데이터 화면에 바로 반영되도록.)
    getFirebase() {
      this.mbooRef()
        .doc('settings')
        .onSnapshot(snapshot => {
          // console.log(snapshot.data().setAsset);
          // document의 값이 있으면
          if (snapshot.exists) {
            const setAsset = snapshot.data().setAsset;
            if (setAsset) {
              this.saveAsset.totalGoal = setAsset.totalGoal;
              this.saveAsset.cashAsset = setAsset.cashAsset;
              this.saveAsset.cashGoal = setAsset.cashGoal;
              this.saveAsset.banks = setAsset.banks;
              this.bankLength = setAsset.banks.length;
            }
          }
        });
    },
  },
};
</script>

<style></style>

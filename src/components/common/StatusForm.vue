<template>
  <div class="status-form">
    <!-- 상태 아이콘 -->
    <div class="status-icon-cont">
      <i v-bind:class="checkIconCondition()"></i>
    </div>
    <!-- 로딩 바 -->
    <div class="loading-bar-cont">
      <div class="loading-bar" v-bind:style="printLoadingBar()">
        <b class="bar-number" v-bind:class="{ 'low-bar': totalPercent < 30 }"
          >{{ totalGoalPercent() }}%</b
        >
      </div>
    </div>
  </div>
</template>

<script>
import { newConversionMonth } from '@/utils/filters';
import { moneybooRef } from '@/api/firestore';

export default {
  created() {
    this.getListData();
    this.getTotalGoal();
  },
  data() {
    return {
      totalGoal: 0,
      totalExpendPrice: 0,
      totalPercent: 0,
      currentUid: this.$store.state.uid, // 현재 로그인한 유저 uid
      listArrLength: 0,
      getAllListData: [],
    };
  },
  methods: {
    // firstore에서 totalGoal DB 가져오기
    getTotalGoal() {
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
              this.totalGoal = setAsset.totalGoal;

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
    },
    // firestore에 있는 저장된 ListData DB를 가져오는 함수
    getListData() {
      const yearsMonth = newConversionMonth();
      // listAdd collection 하위에 있는 document 전체를 불러옴
      this.dailyListAddRef()
        .doc(yearsMonth)
        .onSnapshot(snapshot => {
          if (snapshot.exists) {
            this.getAllListData = snapshot.data().listData;
            this.addExpend();
          } else {
            return console.log('값이 없습니다!');
          }
        });
    },
    // listAdd collection 참조 값
    dailyListAddRef() {
      return this.mbooRef()
        .doc('daily')
        .collection('listAdd');
    },
    mbooRef() {
      return moneybooRef(this.currentUid);
    },
    // 지출값 더하는 함수
    addExpend() {
      console.log('addexpend 실행!');

      const copyList = this.getAllListData;
      let totalPrice = 0;

      if (!copyList) return;
      for (let i = 0; i < copyList.length; i++) {
        if (copyList[i].item == 'expend') {
          let stringToNumber = Number(copyList[i].price);
          totalPrice += stringToNumber;
        }
      }
      return (this.totalExpendPrice = totalPrice);
    },
    totalGoalPercent() {
      // 목표금액 퍼센트 계산
      let percent = 100;
      if (this.totalExpendPrice >= this.totalGoal) {
        this.totalPercent = percent;
        return 100;
      }
      percent = (this.totalExpendPrice / this.totalGoal) * 100;
      percent = percent.toFixed(0);
      this.totalPercent = percent;
      return this.totalPercent;
    },
    checkIconCondition() {
      // 퍼센트에 따른 이모티콘 변화
      if (this.totalPercent <= 15 || this.totalPercent == 0) {
        return 'emo-first';
      } else if (this.totalPercent <= 30) {
        return 'emo-second';
      } else if (this.totalPercent <= 50) {
        return 'emo-third';
      } else if (this.totalPercent <= 65) {
        return 'emo-fourth';
      } else if (this.totalPercent <= 80) {
        return 'emo-fifth';
      } else if (this.totalPercent <= 99) {
        return 'emo-sixth';
      } else return 'emo-seventh';
    },
    printLoadingBar() {
      // 퍼센트에 따른 로딩바의 변화
      let barWidth = this.totalPercent * 1.8;
      if (this.totalExpendPrice >= this.totalGoal) {
        return { width: '186px' };
      } else {
        return { width: `${barWidth}px` };
      }
    },
  },
};
</script>

<style></style>

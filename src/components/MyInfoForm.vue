<template>
  <div class="myinfo-form">
    <div class="status-inform-cont">
      <!-- 현재 목표 도달 상태를 보여주는 이모티콘 -->
      <div>
        <i v-bind:class="checkIconCondition()"></i>
        <!-- <i class="far fa-laugh"></i> -->
      </div>

      <ul>
        <li>
          ID
          <span>{{ id }}</span>
          <!-- <span>asdfger12345</span> -->
        </li>
        <li>
          Nickname
          <span>{{ nickname }}</span>
        </li>
      </ul>
      <!-- <span>ID : {{}}</span>
    <span>Nickname : {{}}</span> -->
    </div>

    <!-- setting페이지로 연결버튼 -->
    <button @click="clickMove()">Setting</button>
  </div>
</template>

<script>
import { newConversionMonth } from '@/utils/filters';
import { moneybooRef } from '@/api/firestore';

export default {
  data() {
    return {
      id: this.$store.state.email,
      nickname: this.$store.state.nickname,
      totalGoal: 0,
      totalExpendPrice: 0,
      totalPercent: 0,
      currentUid: this.$store.state.uid, // 현재 로그인한 유저 uid
    };
  },
  created() {
    this.getListData();
    this.getTotalGoal();
  },
  methods: {
    clickMove() {
      this.$router.push('/setting');
    },
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
              this.totalGoalPercent();

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
      let pushArray = [];
      // listAdd collection 하위에 있는 document 전체를 불러옴
      this.dailyListAddRef()
        .get()
        .then(querySnapshot => {
          const docSnapshot = querySnapshot.docs;
          this.listArrLength = querySnapshot.size; // 문서의 값이 있는지 없는지 판단해서 처리할 용도

          // 데이터가 생성되지 않았을 경우
          if (querySnapshot.empty) {
            this.logMessage = '등록한 내역이 없습니다!!';

            // 데이터가 있을 경우 실행
          } else {
            this.logMessage = ''; // 로그메세지 리셋
            // document 출력

            docSnapshot.forEach(doc => {
              // 현재의 달에 해당하는 것만 담는다
              if (doc.id == yearsMonth) {
                pushArray.push(doc.data().listData);
              }
            });
          }
          // 이렇게 하는 이유가 배열안에 배열을 방지하기 위해서
          this.getAllListData = pushArray[0];
          // 지출값 다 더하는 함수 실행
          this.addExpend();
        })
        .catch(err => {
          console.log('위치는 DailyList 메쏘드', err);
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
  },
};
</script>

<style></style>

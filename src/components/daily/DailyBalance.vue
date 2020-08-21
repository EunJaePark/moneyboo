<template>
  <div class="daily-balance">
    <ul class="daily-balance-cont font-jua">
      <li>
        오늘의 수입<b>{{ checkTodayPrice(date, 'income') }}원</b>
      </li>
      <li>
        오늘의 지출<b>{{ checkTodayPrice(date, 'expend') }}원</b>
      </li>
    </ul>
  </div>
</template>

<script>
import { addComma, newConversionMonth } from '@/utils/filters';
import { moneybooRef } from '@/api/firestore';

export default {
  created() {
    this.getListData();
  },
  data() {
    return {
      listData: this.$store.state.listData,
      date: this.conversionDate(new Date()),
      currentUid: this.$store.state.uid, // 현재 로그인한 유저 uid
      listArrLength: 0,
      getAllListData: [],
      allIncome: 0,
    };
  },
  methods: {
    // firestore에 있는 저장된 DB를 가져오는 함수
    getListData() {
      const yearsMonth = newConversionMonth();
      // listAdd collection 하위에 있는 document 전체를 불러옴
      this.dailyListAddRef()
        .doc(yearsMonth)
        .onSnapshot(snapshot => {
          // if (snapshot.exists) {
          //   this.getAllListData = snapshot.data().listData;
          //   this.incomeToday(this.date);
          // } else {
          //   console.log('값이 없습니다.');
          // }
          snapshot.exists
            ? (this.getAllListData = snapshot.data().listData)
            : console.log('값이 없습니다!');
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
    // 날짜 정렬
    conversionDate(date) {
      // 저장되는 날짜를 한국기준으로 정리해서 저장.
      let month = date.getMonth();
      let todayDate = date.getDate();

      return `${month + 1}.${todayDate}`;
      // 출력 형식 : 7.17
    },
    // 오늘의 수입 & 지출 확인 함수
    checkTodayPrice(date, item) {
      let copyListData = this.getAllListData;
      let totalPrice = 0;
      if (!copyListData) return;
      for (let i = 0; i < copyListData.length; i++) {
        if (copyListData[i].date == date && copyListData[i].item == item) {
          let ppp = Number(copyListData[i].price);
          totalPrice += ppp;
        }
      }
      return addComma(totalPrice);
    },
  },
};
</script>

<style></style>

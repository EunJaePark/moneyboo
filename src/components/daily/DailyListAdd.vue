<template>
  <div class="daily-list-add">
    <form class="add-cont" @submit.prevent="submitList">
      <button
        type="button"
        v-on:click="clickExpendBtn()"
        class="add-expend-btn"
        v-bind:class="{ inputOn: inputControl === 'expend' }"
      >
        지출
      </button>
      <button
        type="button"
        v-on:click="clickIncomeBtn()"
        class="add-income-btn"
        v-bind:class="{ inputOn: inputControl === 'income' }"
      >
        수입
      </button>
      <div>
        <DatePicker
          v-model="date"
          color="green"
          titlePosition="center"
          :available-dates="{
            start: new Date(2020, 0, 1),
            end: new Date(),
          }"
        ></DatePicker>
        <select v-model="selectCategory">
          <option disabled value="">분류</option>
          <option v-for="(name, index) in getCategory" :key="index">{{
            name
          }}</option>
        </select>
        <select class="add-bank" v-model="selectBank">
          <option disabled value="">은행</option>
          <option>현금</option>
          <option v-for="(name, index) in getBankAsset" :key="index">{{
            name.bank
          }}</option>
        </select>
        <input
          class="price-box"
          type="text"
          v-model="price"
          placeholder="금액을 입력해주세요."
        />
        <input
          class="text-box"
          type="text"
          v-model="listText"
          placeholder="상세내역을 입력해주세요."
        />
        <button class="btn small list-add-btn">
          <i class="fas fa-plus"></i>
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import DatePicker from 'v-calendar/lib/components/date-picker.umd';
import { makeDateListID } from '@/utils/filters.js';
import { eventBus } from '@/main.js';
import { moneybooRef, settingColRef } from '@/api/firestore';
import firebase from 'firebase';
import {
  conversionDate,
  checkEmptyList,
  checkPriceNumber,
  selectDateConversionMonth,
} from '@/utils/daily.js';

export default {
  components: { DatePicker },
  created() {
    eventBus.$on('editList', data => {
      // 리스트에서 edit 버튼을 누른다면,

      // 수정 해야 할 원본 배열 editList 에 할당
      this.editList = data;

      // 각 v-model에 연결
      this.date = new Date(`2020 ${data.date}`);
      this.price = data.price;
      this.inputControl = data.item;
      this.selectCategory = data.category;
      this.selectBank = data.bank;
      this.edit = true;
      this.editId = data.id;
      this.listText = data.text;
    });
    // 셋팅페이지에 있는 은행, 카테고리 불러오기
    this.getBanksData();
    this.getCategoriesData();
  },
  computed: {
    ...mapState(['uid']), // 현재 로그인한 유저 uid
  },
  data() {
    return {
      date: new Date(),
      inputControl: 'expend',
      selectCategory: '',
      selectBank: '',
      price: null,
      listText: '',
      edit: false,
      editId: '',
      getCategory: [],
      getBankAsset: [],
      editList: {},
    };
  },
  methods: {
    // firestore에 있는 저장된 은행 DB 불러오기
    getBanksData() {
      this.settingListRef()
        .doc('banks')
        .onSnapshot(snapshot => {
          // document의 값이 있으면
          if (snapshot.exists) {
            const banks = snapshot.data().banks;
            if (banks) {
              this.getBankAsset = banks;
            }
          }
        });
    },
    // firestore에 있는 저장된 카테고리 DB 불러오기
    getCategoriesData() {
      this.settingListRef()
        .doc('categories')
        .onSnapshot(snapshot => {
          // document의 값이 있으면
          if (snapshot.exists) {
            const categories = snapshot.data().categories;
            if (categories) {
              // this.getCategory 에 category 이름만 넣어라.
              categories.forEach(data => {
                this.getCategory.push(data.name);
              });
            }
          }
        });
    },
    mbooRef() {
      return moneybooRef(this.uid);
    },
    settingListRef() {
      // settings document > settingList collection 참조값
      return settingColRef(this.uid);
    },
    dailyListAddRef() {
      return this.mbooRef()
        .doc('daily')
        .collection('listAdd');
    },
    // 수입 지출 버튼에 따른 인풋창 변화.
    clickIncomeBtn() {
      this.inputControl = 'income';
    },
    clickExpendBtn() {
      this.inputControl = 'expend';
    },
    // 리스트 제출 함수
    submitList() {
      // 값이 비는지, 숫자가 맞는지 확인을 먼저 해준다.
      if (
        checkEmptyList(this.selectCategory, this.selectBank, this.price) ||
        checkPriceNumber(this.price)
      )
        return;

      let listData = {};
      // 만약 수정버튼을 눌렀을 때라면,
      if (this.edit === true) {
        listData = {
          id: this.editId,
          date: conversionDate(this.date), // 한국날짜로 변환
          item: this.inputControl,
          category: this.selectCategory,
          bank: this.selectBank,
          price: this.price,
          text: this.listText,
        };
      } else {
        listData = {
          id: makeDateListID('l', this.date),
          date: conversionDate(this.date), // 한국날짜로 변환
          item: this.inputControl,
          category: this.selectCategory,
          bank: this.selectBank,
          price: this.price,
          text: this.listText,
        };
      }

      // firestore에 listData 저장
      const yearsMonth = selectDateConversionMonth(this.date);

      if (this.edit === true) {
        // 수정했을때 수정후 저장 함수 실행
        this.submitEditList(listData, yearsMonth);
      } else {
        this.dailyListAddRef()
          .doc(yearsMonth)
          .get()
          .then(docSnapshot => {
            // 만약 document값이 없으면 초기값 셋팅해주고
            if (!docSnapshot.exists) {
              this.dailyListAddRef()
                .doc(yearsMonth)
                .set({ listData: [listData] });

              // 만약 값이 있다면 배열을 업데이트 해줄것
            } else {
              this.dailyListAddRef()
                .doc(yearsMonth)
                .update({
                  listData: firebase.firestore.FieldValue.arrayUnion(listData),
                });
            }
          })
          .catch(err => {
            console.log('listAdd submitList 부분 에러 발생', err);
          });
      }
      this.resetData(); // 인풋창의 데이터를 리셋해주는 함수
    },
    resetData() {
      // 인풋창의 데이터를 리셋해주는 함수
      this.date = new Date();
      this.selectCategory = '';
      this.selectBank = '';
      this.price = null;
      this.listText = '';
    },
    submitEditList(listData, yearsMonth) {
      // 기존의 배열 삭제
      this.dailyListAddRef()
        .doc(yearsMonth)
        .update({
          listData: firebase.firestore.FieldValue.arrayRemove(this.editList),
        });

      // 수정된 배열 추가
      this.dailyListAddRef()
        .doc(yearsMonth)
        .update({
          listData: firebase.firestore.FieldValue.arrayUnion(listData),
        });
    },
  },
};
</script>

<style></style>

<template>
  <div class="daily-list-add">
    <form class="add-cont" @submit.prevent="submitList">
      <button
        type="button"
        v-on:click="clickIncomeBtn()"
        class="add-income-btn"
        v-bind:class="{ inputOn: inputControl === 'income' }"
      >
        수입
      </button>
      <button
        type="button"
        v-on:click="clickExpendBtn()"
        class="add-expend-btn"
        v-bind:class="{ inputOn: inputControl === 'expend' }"
      >
        지출
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
import DatePicker from 'v-calendar/lib/components/date-picker.umd';
import { makeID, newConversionMonth } from '@/utils/filters.js';
import { eventBus } from '@/main.js';
import { moneybooRef } from '@/api/firestore';
import firebase from 'firebase';

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
    // 셋팅페이지에 있는 데이터 불러오기
    this.getSettingData();    
  },
  data() {
    return {
      date: new Date(),
      inputControl: 'income',
      selectCategory: '',
      selectBank: '',
      price: null,
      listText: '',
      edit: false,
      editId: '',
      currentUid: this.$store.state.uid,
      getCategory: [],
      getBankAsset: [],
      editList: {},
    };
  },
  methods: {
    getSettingData() {
      // 셋팅페이지에 있는 데이터 불러오기
      this.mbooRef()
        .doc('settings')
        .get()
        .then(docSnapshot => {
          // document 값이 있으면
          if (docSnapshot.exists) {
            const setCategory = docSnapshot.data().setCategory;
            const setAsset = docSnapshot.data().setAsset;

            // category와 asset이 셋팅되어있을때만 실행
            if (setCategory && setAsset) {
              // 카테고리
              setCategory.forEach(data => {
                this.getCategory.push(data.name);
              });

              // 에셋
              setAsset.banks.forEach(data => {
                this.getBankAsset.push(data);
              });

              // category나 asset이 설정되어 있지 않을 경우만 실행
            } else {
              // 에러메세지 undefined 값인 데이터에 문자 삽입
              const errMessage =
                setAsset === undefined
                  ? '목표금액과 자산'
                  : setCategory === undefined
                  ? '카테고리'
                  : '관리페이지';

              // 경고창 실행하고 셋팅페이지로 이동
              alert(
                errMessage +
                  '에서 설정값을(를) 등록해주세요! 관리페이지로 이동합니다.',
              );
              this.$router.push('/setting');
            }
            // document 값이 없으면
          } else {
            // setting 페이지로 이동
            alert(
              '관리 페이지에서 초기값을 등록해주세요! 관리페이지로 이동합니다.',
            );
            this.$router.push('/setting');
          }
        })
        .catch(err => {
          console.log('에러가 발생한 위치는 listAdd Created', err);
        });
    },
    mbooRef() {
      return moneybooRef(this.currentUid);
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
    // 값 입력하지 않았을때 확인 함수
    checkEmptyList() {
      if (
        this.selectCategory === '' ||
        this.selectBank === '' ||
        this.price === null ||
        this.price == ' '
      ) {
        alert('값을 선택, 입력해 주세요.');
        return true;
      } else return false;
    },
    // 금액입력 인풋창에 숫자가 맞는지 확인 함수
    checkPriceNumber() {
      // 숫자가 아니면 alert 창을 띄워라
      if (isNaN(this.price)) {
        alert('숫자만 입력해주세요');
        return true;
      } else return false;
    },
    // 리스트 제출 함수
    submitList() {
      // 값이 비는지, 숫자가 맞는지 확인을 먼저 해준다.
      if (this.checkEmptyList() || this.checkPriceNumber()) return;

      let listData = {};
      // 만약 수정버튼을 눌렀을 때라면,
      if (this.edit === true) {
        listData = {
          id: this.editId,
          date: this.conversionDate(this.date), // 한국날짜로 변환
          item: this.inputControl,
          category: this.selectCategory,
          bank: this.selectBank,
          price: this.price,
          text: this.listText,
        };
      } else {
        listData = {
          id: makeID('l'),
          date: this.conversionDate(this.date), // 한국날짜로 변환
          item: this.inputControl,
          category: this.selectCategory,
          bank: this.selectBank,
          price: this.price,
          text: this.listText,
        };
      }

      // firestore에 listData 저장
      const yearsMonth = newConversionMonth();

      if (this.edit === true) {
        // 수정했을때 수정후 저장 함수 실행
        this.submitEditList(listData);
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
      this.inputControl = 'income';
      this.selectCategory = '';
      this.selectBank = '';
      this.price = null;
      this.listText = '';
    },
    conversionDate(date) {
      // 저장되는 날짜를 한국기준으로 정리해서 저장.
      let month = date.getMonth();
      let todayDate = date.getDate();

      return `${month + 1}.${todayDate}`;
      // 출력 형식 : 7.17
    },
    submitEditList(listData) {
      const yearsMonth = newConversionMonth();

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

<template>
  <div class="daily-list" :class="{ 'list-empty': getAllListData.length == 0 }">
    {{ getAllListData }}
    <ul class="daily-list-cont">
      <li v-if="getAllListData.length == 0">
        등록한 내역이 없습니다.
      </li>
      <li
        v-else
        class="daily-list-day"
        v-for="date in sortListDate()"
        :key="date"
      >
        <strong class="font-uto">{{ `${addMonth()}.${date}` }}</strong>
        <em class="daily-list-income"
          >수입 :
          <b class="list-income">{{ checkDayItem(date, 'income') }}원</b></em
        >
        <em class="daily-list-expend"
          >지출 :
          <b class="list-expend">{{ checkDayItem(date, 'expend') }}원</b></em
        >
        <ul>
          <li v-for="list in checkMatchDateList(date)" :key="list.id">
            <i
              class="category-icon"
              :class="convertIntoIcon(list.category)"
            ></i>
            <span class="font-uto"> {{ list.bank }} </span>
            <p class="list-text">{{ list.text }}</p>
            <b v-if="list.item === 'income'"
              ><a
                href="#/daily"
                title="수정하기"
                class="list-income"
                @click.prevent="clickeEditList(list)"
                >+ {{ editCommaPrice(list.price) }} 원</a
              ></b
            >
            <b class="list-expend" v-else>
              <a
                href="#/daily"
                title="수정하기"
                class="list-expend"
                @click.prevent="clickeEditList(list)"
              >
                - {{ editCommaPrice(list.price) }} 원</a
              >
            </b>
            <button
              class="btn list-delete"
              @click.prevent="deleteListData(list)"
            >
              <i class="fas fa-times"></i>
            </button>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
import { addComma, newConversionMonth } from '@/utils/filters';
import { eventBus } from '@/main';
import firebase from 'firebase';
import { moneybooRef } from '@/api/firebase';

export default {
  created() {
    this.getListData();
    this.getCategoryData();
  },
  data() {
    return {
      listDateArray: [],
      currentUid: this.$store.state.uid, // 현재 로그인한 유저 uid
      getAllListData: [],
      listArrLength: 0,
      logMessage: '',
      getCategory: [],
    };
  },
  methods: {
    // firestore에 있는 저장된 카테고리 DB 불러오기
    getCategoryData() {
      this.mbooRef()
        .doc('settings')
        .get()
        .then(docSnapshot => {
          // document 값이 있으면
          if (docSnapshot.exists) {
            const setCategory = docSnapshot.data().setCategory;

            // category와 asset이 셋팅되어있을때만 실행
            if (setCategory) {
              // 카테고리
              setCategory.forEach(data => {
                this.getCategory.push(data);
              });

              // category나 asset이 설정되어 있지 않을 경우만 실행
            } else {
              console.log('setAsset 데이터가 없습니다!', docSnapshot);
            }
            // document 값이 없으면
          } else {
            // setting 페이지로 이동
            console.log('settings 값이 없음', docSnapshot);
          }
        })
        .catch(err => {
          console.log('에러가 발생한 위치는 listAdd Created', err);
        });
    },
    getListData() {
      const yearsMonth = newConversionMonth();

      // listAdd collection 하위에 있는 document 전체를 불러옴
      this.dailyListAddRef()
        .doc(yearsMonth)
        .onSnapshot(snapshot => {
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
    // 날짜 정렬 함수
    sortListDate() {
      // 저장된 객체가 없으면 리턴해서 나가라.
      if (!this.getAllListData) return;

      let copyListArray = this.getAllListData;
      let dateArray = [];

      // date만 dateArray 에 할당, '.'을 기준으로 뒷 자리만 dateArray 에 담는다.
      for (let i = 0; i < copyListArray.length; i++) {
        dateArray[i] = copyListArray[i].date.split('.')[1];
      }
      // dateArray, 즉 입력값이 하나면 그대로 dateArray에 담고 나가라.
      if (dateArray.length == 1) {
        return (this.listDateArray = dateArray);
      }
      // 1개 이상이라면 내림차순으로 정렬한다. ( 최근 리스트가 가장 위로 올라오게 하기 위함)
      dateArray.sort(function(a, b) {
        return b - a;
      });
      // 중복값 제거 ( 중복값 세개이상일때 예외처리 해야함)
      for (let i = 0; i < dateArray.length; i++) {
        if (dateArray[i] === dateArray[i - 1]) {
          // 값이 같다면 지워라
          dateArray.splice(i, 1);
          // 위에서 splice 로 중복값을 지워줬기 때문에 i값도 빼줘야 dateArray를 순차적으로 돌수있다.
          i--;
        }
      }

      // 중복값이 없다면 this.listDateArray 에 할당후 함수를 빠져나가라.
      return (this.listDateArray = dateArray);
    },
    // 하루 수입, 지출 확인 함수
    checkDayItem(date, item) {
      let copyListArray = this.getAllListData;
      let totalPrice = 0;
      if (!copyListArray) return;
      for (let i = 0; i < copyListArray.length; i++) {
        if (
          copyListArray[i].item === item &&
          copyListArray[i].date.split('.')[1] === date
        ) {
          let stringToNumber = Number(copyListArray[i].price);
          totalPrice += stringToNumber;
        }
      }
      return addComma(totalPrice);
    },
    // 수정버튼 눌렀을때의 함수
    clickeEditList(data) {
      console.log('수정해야할 리스트', data);
      eventBus.editList(data);
    },
    editCommaPrice(price) {
      return addComma(price);
    },
    // 카테고리 이름을 아이콘으로 변경해주는함수
    convertIntoIcon(category) {
      let copyCategorys = this.getCategory;
      let categoryIconNum = 0;

      for (let i = 0; i < copyCategorys.length; i++) {
        if (copyCategorys[i].name == category) {
          categoryIconNum = i;
          // 같은걸 찾으면 바로 return 해줘라
          return copyCategorys[categoryIconNum].icon;
        }
      }
    },
    // 삭제버튼을 눌렀을때의 함수
    deleteListData(list) {
      const yearsMonth = newConversionMonth();
      this.dailyListAddRef()
        .doc(yearsMonth)
        .update({
          listData: firebase.firestore.FieldValue.arrayRemove(list),
        });
    },
    // date 에 맞는 list 만 불러오는 함수
    checkMatchDateList(date) {
      if (!this.getAllListData) return;
      let pushArray = [];
      for (let i = 0; i < this.getAllListData.length; i++) {
        if (date === this.getAllListData[i].date.split('.')[1]) {
          pushArray.push(this.getAllListData[i]);
        }
      }
      return pushArray;
    },
    // 월 만 추가해주고 리턴하는 함수
    addMonth() {
      const month = new Date().getMonth() + 1;
      return month;
    },
    conversionMonth(date) {
      const years = String(date.getFullYear()).substr(2, 2);
      const month =
        date.getMonth() < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;

      return `${years}.${month}`;
    },
  },
};
</script>

<style></style>

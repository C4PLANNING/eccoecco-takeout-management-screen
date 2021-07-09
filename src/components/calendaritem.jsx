import React, { useEffect, useState } from "react";

import firebase from "firebase/app";
import "firebase/firestore";
import UpdateBookingMaxItem from "./updatebookingmaxitem";
  
function zeroPadding(date) {
  var [year, month, day] = date.split("/");
  return year + "-" + ("0" + month).slice(-2);
}

const holidays = ["01-01", "01-11", "02-11", "02-23", "03-20", "04-29", "05-03", "05-04", "05-05", "07-22", "07-23", "08-09", "09-20", "09-23", "11-03", "11-23"];
const CalendarItem = () => {
  const DEFAULT_ORDER_LIMIT = 5;
  const weeks = ['日', '月', '火', '水', '木', '金', '土'];
  const timeList = ["11時台", "12時台", "13時台", "14時台", "17時台", "18時台", "19時台", "20時台", "21時台"];
  const date = new Date();
  const config = {
    show: 1,
  };
  const [isExists, setIsExists] = useState(false);
  const [year, setYear] = useState(date.getFullYear());
  const [month, setMonth] = useState(date.getMonth() + 1)
  const [monthly, setMonthly] = useState({});
  const [allStop, setAllStop] = useState([false, ""]);
  /* 初期化するためのカラ変数配列 */
  const initialItemState = [
    {
      id: zeroPadding(new Date().toLocaleDateString()),
      day: "",
      max: [],
    },
  ];
  /* currentItemステート変数をセット */
  const [currentItem, setCurrentItem] = useState(initialItemState);
  /* 編集モードフラッグステート変数をセット */
  const [editing, setEditing] = useState(false);

  /* editモードをtrueにしてcurrentItemにEditボタンを押下したitemを格納　*/
  const editItem = (day) => {
    setCurrentItem({
      id: monthly.id,
      day: day,
      max: monthly.max[day],
    });
    setEditing(true);
  };

  useEffect(() => {
    showCalendar(year, month);
  }, [monthly, editing])

  useEffect(() => {
    setEditing(false); 
  }, [monthly])
  
  useEffect(() => {
    const _month = ("0" + month).slice(-2);
    const _id = `${year}-${_month}`;
    const unsubscribe = firebase
      .firestore()
      .collection("booking")
      .doc(_id)
      .onSnapshot((doc) => {
        if (doc.exists) {
          setMonthly({
            id: doc.id,
            ...doc.data(),
          });
        
        } else {
          setMonthly({})
        }
        setIsExists(doc.exists);
      });
    return () => unsubscribe();
  }, [month]);

  const showCalendar = async (year, month) => {
    const _id = year + "-" + ("0" + month).slice(-2);
    for (let i = 0; i < config.show; i++) {
      const calendarHtml = await createCalendar(year, month);
      
      document.querySelector('#calendar').innerHTML = ''
      const sec = document.createElement('section')
      sec.innerHTML = calendarHtml
      document.querySelector('#calendar').appendChild(sec)
      document.querySelectorAll(".button").forEach((el, day) => el.addEventListener("click", () => { setAllStop([monthly.stop[day], day]); editItem(day); }));
      if (Object.keys(monthly).length <= 0) {
        const elem = document.querySelector('.collapse');
        elem.parentNode.removeChild(elem);
      }
      document.querySelectorAll('.stop-booking').forEach((el, day) => el.addEventListener("click", () => _onclick(el.id, el.checked)));
    }
  }

  const createCalendar = async (year, month) => {
    const startDate = new Date(year, month - 1, 1) // 月の最初の日を取得
    const endDate = new Date(year, month, 0) // 月の最後の日を取得
    const endDayCount = endDate.getDate() // 月の末日
    const startDay = startDate.getDay() // 月の最初の日の曜日を取得
    let dayCount = 1 // 日にちのカウント
    let calendarHtml = '' // HTMLを組み立てる変数

    calendarHtml += '<h1>' + year + '/' + month + '</h1>';
    calendarHtml += '<table>';
    
    // 曜日の行を作成
    for (let w = 0; w < 6; w++) {
      for (let i = 0; i < weeks.length; i++) {
        if (weeks[i] === "日") {
          calendarHtml += '<td class="red week">' + weeks[i] + '</td>'
        } else if (weeks[i] === "土") {
          calendarHtml += '<td class="blue week">' + weeks[i] + '</td>'
        } else {
          calendarHtml += '<td class="week">' + weeks[i] + '</td>'
        }
      }
    }
    calendarHtml += '<tr>';
    for (let w = 0; w < 6; w++) {
      for (let d = 0; d < 7; d++) {
        if (w == 0 && d < startDay) {
        
          calendarHtml = calendarHtml.replace(/\<td.*?\>.+?\<\/td\>/, "")
          // 1行目で1日の曜日の前
        } else if (dayCount > endDayCount) {
          // 末尾の日数を超えた
          calendarHtml = calendarHtml.replace(/(.*)\<td.*\>.+?\<\/td\>(\<tr\>.*)/, "$1$2")
        } else {
          calendarHtml += '<td>' + dayCount + '</td>'
          dayCount++
        }
      }
    }
    calendarHtml = calendarHtml.replace(/\<table\>/, "<table><td rowspan='2'>日付</td>")
    calendarHtml += '</tr><tr><td>予約数</td>';

    const cur_val = monthly && monthly.current;
    [...Array(dayCount - 1)].map((_, day) => {
      //月
      const _month = ("0" + month).slice(-2);
      //日
      const _date = ("0" + (day + 1)).slice(-2);
      const _id = `current-${year}-${_month}-${_date}`
      calendarHtml += `<td class="current-booking" id=${_id}>${cur_val ? cur_val[day] : 0}</td>`;
    });
    calendarHtml += "</tr>";

    if (editing) {
      calendarHtml += "<tr><td>一括売止</td>";
      const stop_flag = monthly && monthly.stop;
      [...Array(dayCount - 1)].map((_, day) => {
        //月
        const _month = ("0" + month).slice(-2);
        //日
        const _date = ("0" + (day + 1)).slice(-2);
        const _id = `stop-${year}-${_month}-${_date}`;
        calendarHtml += `<td><input type="checkbox" class="stop-booking" id=${_id} ${stop_flag && stop_flag[day] ? "checked" : ""} /></td>`;
      });
      calendarHtml += '</tr>';
    }

    calendarHtml += '<tr class="collapse"><td style="min-width: 80px;">販売数上限</td>';
    [...Array(dayCount - 1)].map((_, day) => {
      calendarHtml += `<td><button class="button">▽</button></td>`;
    });
    
    calendarHtml += '</tr></table>';
   
    return calendarHtml;
  }

  const moveCalendar = (e) => {
    if (e.target.id === 'prev') {
      setMonth(month - 1)
      if (month <= 1) {
        setYear(year - 1)
        setMonth(12)
      }
    }

    if (e.target.id === 'next') {
      setMonth(month + 1)
      if (month >= 12) {
        setYear(year + 1)
        setMonth(1)
      }
    }
    showCalendar(year, month);
  }

  const _onclick = (id, flag) => {
    const _id = id.split("-").slice(1).join("-")
    setAllStop([flag, _id]);
  }
  
  const setting = async () => {
    //月
    const _month = ("0" + month).slice(-2);
    const _id = `${year}-${_month}`;

    let curList = [];
    document.querySelectorAll('.current-booking').forEach(cur => curList.push(parseInt(cur.textContent, 10)));
    
    let weekend = [];
    document.querySelectorAll('.week').forEach(day => weekend.push(day.textContent === "日" ? true : false));
    let stopList = []
    document.querySelectorAll('.stop-booking').forEach((_, i) => stopList.push(weekend[i] || holidays.includes(_month + "-" + ("0" + (i + 1)).slice(-2)) ? true : false));

    const daily = {}
    stopList.forEach((flag, i) => {
      let stop_timezone = {}
      timeList.forEach((time) => stop_timezone[time] = [flag, flag ? 0 : DEFAULT_ORDER_LIMIT]);
      daily[i] = stop_timezone
    })
    try {
      await firebase
        .firestore()
        .collection("booking")
        .doc(_id)
        .set({
          current: curList,
          stop: stopList,
          max: daily,
        });
    } catch (e) {
      console.log(e);
    }
    setIsExists(true);
    alert("初期値を設定しました");
  }

  return (
    <>
      <button id="prev" type="button" onClick={(e) => moveCalendar(e)}>前の月</button>
      <button id="next" type="button" onClick={(e) => moveCalendar(e)}>次の月</button>
      <div id="calendar"></div>
      {editing && (
        <UpdateBookingMaxItem
          setEditing={setEditing}
          currentItem={currentItem}
          allStop={allStop}
        />
      )}
      <div style={{ display: editing ? "none" : "block"}}>
        {!isExists && <button id="before" onClick={setting}>初期値設定</button>}
      </div>
    </>
  );
};

export default CalendarItem;

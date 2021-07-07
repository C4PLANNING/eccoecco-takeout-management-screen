import React, { useState, useEffect, useRef } from "react";
import firebase from "firebase/app";
import "firebase/firestore";

const timeList = ["11時台", "12時台", "13時台", "14時台", "17時台", "18時台", "19時台", "20時台", "21時台"];
const UpdateBookingMaxItem = ({ setEditing, currentItem, allStop }) => {
  const [item, setItem] = useState(currentItem);
  const [flag, setFlag] = useState([]);
  const renderFlgRef = useRef(null);
  
  useEffect(() => {
    setItem(currentItem);
    const list = currentItem.max;
    setFlag(timeList.map(time => list[time][0]));
    console.log("useEffectが渡したcurrentItem: ", currentItem);
    document
      .querySelectorAll(".stop-timezone-booking-" + currentItem.id + "-" + ("0" + (currentItem.day + 1))
      .slice(-2)).forEach((el, i) => el.checked = timeList.map(time => list[time][0])[i]);
  }, [currentItem]);

  useEffect(() => {
    if (renderFlgRef.current) {
      document.querySelectorAll(".stop-timezone-booking-" + allStop[1]).forEach((el) => el.checked = allStop[0]);
      const newFlag = Array.from(flag);
      setFlag(newFlag.map(i => allStop[0]));
    } else {
      renderFlgRef.current = true
    }
  }, [allStop])

  const updateFlag = (i) => {
    const newFlag = Array.from(flag);
    newFlag.splice(i, 1, !flag[i]);
    setFlag(newFlag);
  }

  const isReallyNaN = (x) => {
    return x !== x;    // xがNaNであればtrue, それ以外ではfalse
  }

  const submit = async (e) => {
    e.preventDefault();
    console.log("onSubmitで渡されたidとitems", { item });
    let stopList = []
    document
      .querySelectorAll(".stop-timezone-booking-" + currentItem.id + "-" + ("0" + (currentItem.day + 1)).slice(-2))
      .forEach(stop => stopList.push(stop.checked ? true : false));
    stopList.forEach((stop, i) => {
      const value = parseInt(item.max[timeList[i]][1], 10);
      item.max[timeList[i]] = [stop, stop ? 0 : value];
    })

    //バリデーションチェック
    const bookingList = document.querySelectorAll('.max-booking');
    for (let i = 0; i < bookingList.length; i++) {
      if (!flag[i] && (isReallyNaN(parseInt(bookingList[i].value, 10)) || parseInt(bookingList[i].value, 10) < 0)) {
        alert("正しい数値を入力してください");
        return;
      }
    }
    try {
      const data = await firebase
        .firestore()
        .collection("booking")
        .doc(currentItem.id)
        .get();
      if (data.exists) {
        const _max = data.data().max;
        const newMax = { ..._max, [currentItem.day]: item.max };
        const _stop = data.data().stop;
        let newStop = Array.from(_stop);
        if (flag.every(i => i)) {
          newStop.splice(currentItem.day, 1, true);
        } else {
          newStop.splice(currentItem.day, 1, false);
        }
        await firebase
          .firestore()
          .collection("booking")
          .doc(currentItem.id)
          .update({
            max: newMax,
            stop: newStop
          })
        alert("更新完了しました");
        // window.location.reload();
      } else {
        console.log("error")
      }
    } catch (e) {
      console.log(e);
    }
  };
  
  const onChange = e => {
    let { id, value } = e.target;
    const index = parseInt(id.split("-").pop(), 10);
    const newValue = item.max[timeList[index]];
    newValue[1] = parseInt(value, 10);
    let newMax = item.max;
    newMax[timeList[index]] = newValue;
    setItem({ ...item, max: newMax });
  };

  return (
    <>
      <h4>{currentItem.day+1}日</h4>
      <table>
        <tbody>
          <tr>
            <th>時間</th>
            <th>売止</th>
            <th>販売数上限</th>
          </tr>
          {timeList.map((time, i) => {
            return (
              <tr>
                <td>{time}</td>
                <td><input type="checkbox" class={"stop-timezone-booking-" + currentItem.id + "-" + ("0" + (currentItem.day + 1)).slice(-2)} id={"stop-timezone-booking" + currentItem.id + "-" + ("0" + (currentItem.day + 1)).slice(-2) + "-" + i} onClick={() => updateFlag(i)} /></td>
                <td><input type="number" class="max-booking" id={"stop-timezone-booking-number" + currentItem.id + "-" + ("0" + (currentItem.day + 1)).slice(-2) + "-" + i} value={!flag[i] ? item.max[time][1] : ""} onChange={onChange} style={{ maxWidth: 30, border: "none" }} /></td>
              </tr>
            )
          }
          )}
        </tbody>
      </table>
      <button id="submit" onClick={submit}>日次更新</button>
      <button onClick={() => setEditing(false)}>キャンセル</button>
    </>
  );
}

export default UpdateBookingMaxItem;
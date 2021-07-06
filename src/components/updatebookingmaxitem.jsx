import React, { useState, useEffect, useRef } from "react";
import firebase from "firebase/app";
import "firebase/firestore";

const timeList = ["11時台", "12時台", "13時台", "14時台", "17時台", "18時台", "19時台", "20時台", "21時台"];
const UpdateBookingMaxItem = ({ setEditing, currentItem, allStop }) => {
  const [item, setItem] = useState(currentItem);
  const [flag, setFlag] = useState([]);
  const ref_0 = useRef(null);
  const ref_1 = useRef(null);
  const ref_2 = useRef(null);
  const ref_3 = useRef(null);
  const ref_4 = useRef(null);
  const ref_5 = useRef(null);
  const ref_6 = useRef(null);
  const ref_7 = useRef(null);
  const ref_8 = useRef(null);
  const refs = [ref_0, ref_1, ref_2, ref_3, ref_4, ref_5, ref_6, ref_7, ref_8];
  const valueRef_0 = useRef(null);
  const valueRef_1 = useRef(null);
  const valueRef_2 = useRef(null);
  const valueRef_3 = useRef(null);
  const valueRef_4 = useRef(null);
  const valueRef_5 = useRef(null);
  const valueRef_6 = useRef(null);
  const valueRef_7 = useRef(null);
  const valueRef_8 = useRef(null);
  const valueRefs = [valueRef_0, valueRef_1, valueRef_2, valueRef_3, valueRef_4, valueRef_5, valueRef_6, valueRef_7, valueRef_8];
  const renderFlgRef = useRef(null);
  
  useEffect(() => {
    setItem(currentItem);
    const list = currentItem.max.map((item) => Object.values(item)[0][0]);
    setFlag(list);
    console.log("useEffectが渡したcurrentItem: ", currentItem);
    document.querySelectorAll(".stop-timezone-booking-" + currentItem.id + "-" + ("0" + (currentItem.day + 1)).slice(-2)).forEach((el, i) => el.checked = list[i]);
    
  }, [currentItem]);

  useEffect(() => {
    if (renderFlgRef.current) {
      document.querySelectorAll(".stop-timezone-booking-" + allStop[1]).forEach((el) => el.checked = allStop[0]);
    } else {
      renderFlgRef.current = true
    }
  }, [allStop])

  const updateFlag = (i) => {
    const newFlag = Array.from(flag);
    newFlag.splice(i, 1, !flag[i]);
    setFlag(newFlag)
  }

  const submit = async (e) => {
    e.preventDefault();
    console.log("onSubmitで渡されたidとitems", { item });
    let stopList = []
    document.querySelectorAll(".stop-timezone-booking-" + currentItem.id + "-" + ("0" + (currentItem.day + 1)).slice(-2)).forEach(stop => stopList.push(stop.checked ? true : false));
    stopList.forEach((stop, i) => { const value = parseInt(Object.values(item.max[i])[0][1], 10); item.max[i][timeList[i]] = [stop, stop ? 0 : value]; })
    console.log(currentItem.id)
    try {
      const data = await firebase
        .firestore()
        .collection("booking")
        .doc(currentItem.id)
        .get();
      if (data.exists) {
        const _max = data.data().max
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
        window.location.reload();
      } else {
        console.log("error")
      }
    } catch (e) {
      console.log(e);
    }
  };
  
  const onChange = e => {
    let { id, value } = e.target;
    const index = id.split("-").pop();
    const [newValue] = Object.values(item.max[index]);
    newValue[1] = parseInt(value, 10);
    let newMax = Array.from(item.max);
    newMax.splice(index, 1, { [timeList[index]]: newValue });
    setItem({ ...item, max: newMax });
  };

  return (
    <>
      <p>{currentItem.day+1}日</p>
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
                <td><input type="checkbox" class={"stop-timezone-booking-" + currentItem.id + "-" + ("0" + (currentItem.day + 1)).slice(-2)} id={"stop-timezone-booking" + currentItem.id + "-" + ("0" + (currentItem.day + 1)).slice(-2) + "-" + i} ref={refs[i]} onClick={() => updateFlag(i)} /></td>
                <td><input type="number" class="max-booking" id={"stop-timezone-booking-number" + currentItem.id + "-" + ("0" + (currentItem.day + 1)).slice(-2) + "-" + i} value={!flag[i] ? item.max[i][time][1] : ""} onChange={onChange} style={{ maxWidth: 30, border: "none" }} ref={valueRefs[i]} /></td>
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
import React, { useState, useEffect } from "react";

const timeList = ["11時台", "12時台", "13時台", "14時台", "17時台", "18時台", "19時台", "20時台", "21時台"];
const DEFAULT_ORDER_LIMIT = 5;
const UpdateBookingMaxItem = ({ setEditing, currentItem, updateItem, allStop }) => {
  const [item, setItem] = useState(currentItem);

  useEffect(() => {
    setItem(currentItem);
    console.log("useEffectが渡したcurrentItem: ", currentItem);
  }, [currentItem]);

  const onSubmit = e => {
    e.preventDefault();
    console.log("onSubmitで渡されたidとitems", { item });
    updateItem({ currentItem }, item);
  };
  
  const onChange = e => {
    let { name, value } = e.target;
    setItem({ ...item, [name]: value });
  };

  return (
    <>
      <table>
        <tbody>
          <tr>
            <th>時間</th>
            <th>売止</th>
            <th>販売数上限</th>
          </tr>
          {timeList.map((time, i) => {
            const flag = currentItem.max[i][time][0]
            return (
              <tr>
                <td>{time}</td>
                {flag ? <td><input type="checkbox" class="stop-timezone-booking" id={currentItem.id + "-" + (currentItem.day + 1) + "-" + i} checked /></td> : <td><input type="checkbox" class="stop-timezone-booking" id={currentItem.id + "-" + (currentItem.day + 1) + "-" + i} /></td>}
                <td><input type="number" class="max-booking" id={currentItem.date} value={!flag && currentItem.max[i][time][1]} style={{ maxWidth: 30, border: "none" }} /></td>
              </tr>
            )
          }
          )}
        </tbody>
      </table>
      <button onClick={() => setEditing(false)}>キャンセル</button>
    </>
  );
}

export default UpdateBookingMaxItem;
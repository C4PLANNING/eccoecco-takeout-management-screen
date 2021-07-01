import React, { useState, useEffect } from "react"
import firebase from "firebase/app";
import "firebase/firestore";
import "../styles/global.css"


const useItems = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const unsubscribe = firebase
    firebase
      .firestore()
      .collection("transaction")
      .onSnapshot(snapshot => {
        const data = []
        snapshot.forEach(d => data.push({ // snapshot.doc.mapではだめだった
          id: d.id,
          orders: d.data().planName.split("\n").map((value) => value.split("×")),
          count: d.data().planName.split("\n").length,
          ...d.data(),
        }));
        setItems(data)
      });
    return () => unsubscribe();
  }, []);
  return items;
};

const OrderList = ({ orderItem }) => {
  const listOrder = useItems();
  return (
    <table className="tg">
      <tbody>
      <tr>
        <th>時間</th>
        <th>メニュー名</th>
        <th>数</th>
        <th>値段</th>
        <th>顧客名</th>
        <th>電話番号</th>
      </tr>
      </tbody>

      {listOrder.map(item => (
      <tbody key={item.id}>
        <tr>
          <td rowspan={item.count}>{item.reservationTime}</td>
          <td>{item.orders[0][0]}</td>
          <td>{item.orders[0][1]}</td>
          <td rowspan={item.count}>{item.planPrice}</td>
          <td rowspan={item.count}>{item.userName}</td>
          <td rowspan={item.count}>{item.userTel}</td>
        </tr>
        {item.orders.slice(1).map((row, i) => (
          <tr key={i}>
            <td>{row[0]}</td>
            <td>{row[1]}</td>
          </tr>
        ))}
      </tbody>
      ))}
    </table>
  )
}

export default OrderList
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
      .collection("items")
      .onSnapshot(snapshot => {
        const data = []
        snapshot.forEach(d => data.push({ // snapshot.doc.mapではだめだった
          uid: d.id,
          ...d.data(),
        }));
        setItems(data)
      });
    return () => unsubscribe();
  }, []);
  return items;
};

// const deleteItem = (id) => {
//   firebase
//     .firestore()
//     .collection("items")
//     .doc(id)
//     .delete()
// }


const ItemList = ({editItem}) => {
  /* useItem() API を listItem変数に格納 */
  const listItem = useItems()
  return (
    <table className="tg">
      <tbody>
      <tr>
        <th>名称</th>
        <th>タイプ</th>
        <th>価格</th>
        <th>卵トッピング</th>
        <th>ストック</th>
        <th></th>
      </tr>
      </tbody>

      {listItem.map(item => (
        <tbody key={item.id}>
          <tr>
            <td>{item.name}</td>
            <td>{item.type}</td>
            <td>{item.price}</td>
            <td>{item.egg ? "あり" : "なし"}</td>
            <td>{item.stock ? "あり" : "なし"}</td>
            <td>
              <button onClick={() => editItem(item)}>編集</button>
              {/* <button onClick={() => deleteItem(item.id)}>Delete</button> */}
            </td>
          </tr>
        </tbody>
      ))}
    </table>
  )
}

export default ItemList
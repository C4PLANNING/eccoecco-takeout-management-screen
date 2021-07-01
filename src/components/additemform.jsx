import React, { useState } from "react"
import firebase from "firebase/app";
import "firebase/firestore";

const AddItemForm = () => {

  const [name, setName] = useState("")
  const [type, setType] = useState("料理")
  const [price, setPrice] = useState("¥")
  const [imageUrl, setImageUrl] = useState("")
  const [egg, setEgg] = useState(true);
  const [stock, setStock] = useState(true);

const onSubmit = e => { // eはevent
    /* 
    preventDefaultでページがリロードされるのを防ぐ
    */
    e.preventDefault()
    firebase
        .firestore()
        .collection("items")
        .add({
          name,
          type,
          price,
          imageUrl,
          egg,
          stock
        })
        //.then でフォームクリア
        .then(() => setName(""), setType("料理"), setPrice("¥"), setImageUrl(""), setEgg(true), setStock(true))
}

    return (
      <form onSubmit={onSubmit}>
        <label htmlFor="Update Item">アイテム:</label><br/>
            <field>
              <label>名称　</label>
              <input
                value={name}
                name="name"
                /*  e.currentTarget.value にインプットされた値が入る */
                onChange={e => setName(e.currentTarget.value)}
                type="text"
              />
            </field><br />
            <field>
              <label>タイプ</label>
                <select name="type" onChange={e => setType(e.currentTarget.value)}>
                    <option value="料理">料理</option>
                    <option value="オプション">オプション</option>
                </select>
            </field><br />
            <field>
              <label>料金　</label>
                <input
                  value={price}
                  name="price"
                  onChange={e => setPrice(e.currentTarget.value)}
                  type="text"
                />
            </field><br />
            <field>
              <label>写真URL</label>
              <input
                value={imageUrl}
                name="imageUrl"
                onChange={e => setImageUrl(e.currentTarget.value)}
                type="text"
              />
            </field><br />
            <field>
              <label>卵トッピング</label>
              <select name="egg" onChange={e => setEgg(e.currentTarget.value === "true" ? true : false)}>
                <option value={true}>あり</option>
                <option value={false}>なし</option>
              </select>
            </field><br />
            <field>
              <label>ストック</label>
              <select name="stock" onChange={e => setStock(e.currentTarget.value === "true" ? true : false)}>
                <option value={true}>あり</option>
                <option value={false}>なし</option>
              </select>
            </field><br />
        <button>メニュー追加</button>
      </form>
    )

 }
export default AddItemForm
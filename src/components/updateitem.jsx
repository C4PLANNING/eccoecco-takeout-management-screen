import React, { useState, useEffect } from "react";

const UpdateItem = ({setEditing, currentItem, updateItem }) => {

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


    // const onChange = e => {
    //     let { name, value } = e.target;
    //     if (name === "price") value = "¥" + value;
    //     setItem({ ...item, [name]: value });
    // };

    const onSelectedChange = e => {
        const { name, value } = e.target;
        setItem({ ...item, [name]: value === "true" ? true : false});
    }

    return (
        <>
        <h2>メニュー更新</h2>
        <form onSubmit={onSubmit}>
            <label htmlFor="Update Item">アイテム:</label><br/>
            <field>
                <label>名称　</label>
                {item.name}
            </field><br/>
            <field>
                <label>タイプ　</label>
                {item.type}
            </field><br/>
            <field>
                <label>価格　¥</label>
                {item.price.slice(1)}
            </field><br/>
            <field>
                <label>卵トッピング</label>
                <select name="egg" value={item.egg} onChange={onSelectedChange}>
                    <option value={true}>あり</option>
                    <option value={false}>なし</option>
                </select>
            </field><br />
            <field>
                <label>ストック</label>
                <select name="stock" value={item.stock} onChange={onSelectedChange}>
                    <option value={true}>あり</option>
                    <option value={false}>なし</option>
                </select>
            </field><br/>
            <button>更新</button>
            <button onClick={()=>setEditing(false)}>キャンセル</button>
        </form>
        </>
    )
}
export default UpdateItem
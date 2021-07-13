import React, { useState, useEffect } from "react";
import { Link, navigate } from "gatsby";
import { getUser, isLoggedIn, logout } from "../services/auth";
import {
  createMuiTheme,
  ThemeProvider,
  makeStyles,
  createStyles,
} from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";

import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";

import firebase from "firebase/app";
import "firebase/firestore";
import OrderList from "../components/orderlist";
import ItemList from "../components/itemlist";
import AddItemForm from "../components/additemform";
import UpdateItem from "../components/updateitem";
import CalendarItem from "../components/calendaritem";
import Transaction from "../components/transaction";
import "../styles/global.css";

import { jaJP } from "@material-ui/core/locale";
import CenteredTabs from "../components/CenteredTabs";

const useStyles = makeStyles((theme) =>
  createStyles({
    content: {
      flexGrow: 1,
      height: "100vh",
      overflow: "auto",
    },
    container: {
      paddingTop: 16,
      paddingRight: 0,
      paddingLeft: 0,
    },
  })
);

const theme = createMuiTheme(
  {
    typography: {
      body1: {
        fontSize: 14,
      },
    },
  },
  jaJP
);

export default () => {
  const classes = useStyles();
  /* 初期化するためのカラ変数配列 */
  const initialItemState = [
    {
      id: null,
      name: "",
      type: "料理",
      price: "",
      image: "",
      egg: true,
      stock: true,
    },
  ];
  /* currentItemステート変数をセット */
  const [currentItem, setCurrentItem] = useState(initialItemState);

  /* 編集モードフラッグステート変数をセット */
  const [editing, setEditing] = useState(false);
  const [greetingMessage, setGreetingMessage] = useState("");

  useEffect(() => {
    let _greetingMessage = "";
    if (isLoggedIn()) {
      _greetingMessage = `Hello ${getUser().name} さん`;
    } else {
      _greetingMessage = "ログインしていません";
      navigate(`/login`);
    }
    setGreetingMessage(_greetingMessage);
  }, []);

  /* editモードをtrueにしてcurrentItemにEditボタンを押下したitemを格納　*/
  const editItem = (item) => {
    setEditing(true);
    setCurrentItem({
      uid: item.uid,
      id: item.id,
      name: item.name,
      type: item.type,
      price: item.price,
      imageUrl: item.imageUrl,
      egg: item.egg,
      stock: item.stock,
    });
  };

  /* firestoreのデータを更新 */
  const updateItem = ({ currentItem }, updatedItem) => {
    console.log("Firestoreで更新するデータ:　", updatedItem, currentItem.id);
    //editフラグをfalseに
    console.log(currentItem.id);
    setEditing(false);
    firebase
      .firestore()
      .collection("items")
      .doc(currentItem.uid)
      .update(updatedItem);
  };

  return (
    <ThemeProvider theme={theme}>
      <main className={classes.content}>
        <Container maxWidth="sm" className={classes.container}>
          <Box display="flex">
            <span>{greetingMessage}</span>
            {isLoggedIn() ? (
              <Button
                style={{
                  marginLeft: "auto",
                  backgroundColor: "mediumslateblue",
                  color: "white",
                }}
              >
                <Link to="/login" onClick={logout} style={{ color: "white" }}>
                  ログアウト
                </Link>
              </Button>
            ) : (
              <Link to="/login">ログイン</Link>
            )}
          </Box>
          <CenteredTabs labels={["オーダー", "販売数管理", "メニュー", "履歴"]}>
            <Box my={4}>
              <h2>オーダー一覧</h2>
              <OrderList />
            </Box>

            <Box my={4}>
              <h2>販売数管理</h2>
              <CalendarItem />
            </Box>

            <Box my={4}>
              <h2>メニュー一覧</h2>
              <ItemList editItem={editItem} />
              {/* <h2>メニュー追加</h2>
          <AddItemForm /> */}
              {editing && (
                <UpdateItem
                  setEditing={setEditing}
                  currentItem={currentItem}
                  updateItem={updateItem}
                />
              )}
            </Box>

            <Box my={4}>
              <h2>オーダー履歴</h2>
              <Transaction />
            </Box>
          </CenteredTabs>
        </Container>
      </main>
    </ThemeProvider>
  );
};

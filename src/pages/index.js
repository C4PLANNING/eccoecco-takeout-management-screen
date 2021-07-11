import React, { useState } from "react";
import {
  createMuiTheme,
  ThemeProvider,
  makeStyles,
  createStyles,
} from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";

import firebase from "firebase/app";
import "firebase/firestore";
import OrderList from "../components/orderlist";
import ItemList from "../components/itemlist";
import AddItemForm from "../components/additemform";
import UpdateItem from "../components/updateitem";
import CalendarItem from "../components/calendaritem";
import "../styles/global.css";

import { jaJP } from "@material-ui/core/locale";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import CenteredTabs from "../components/CenteredTabs";

const useStyles = makeStyles((theme) =>
  createStyles({
    toolbar: {
      paddingRight: 24,
      backgroundColor: "#5288B0",
    },
    headerLeft: {
      display: "flex",
      // justifyContent: "space-around",
      color: "#fff",
      marginRight: "auto",
    },
    appBarSpacer: {
      minHeight: 64,
    },
    content: {
      flexGrow: 1,
      height: "100vh",
      overflow: "auto",
    },
    container: {
      paddingTop: 32,
      paddingBottom: 32,
    },
  })
);

const theme = createMuiTheme({}, jaJP);

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
      <AppBar>
        <Toolbar className={classes.toolbar}>
          <div className={classes.headerLeft}>
            <Typography variant="h6" component="h1" gutterBottom>
              エッコ・エッコ上野店 LINEテイクアウト管理画面{" "}
            </Typography>
          </div>
        </Toolbar>
      </AppBar>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="sm" className={classes.container}>
          <CenteredTabs labels={["オーダー", "販売数管理", "メニュー"]}>
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
          </CenteredTabs>
        </Container>
      </main>
    </ThemeProvider>
  );
};

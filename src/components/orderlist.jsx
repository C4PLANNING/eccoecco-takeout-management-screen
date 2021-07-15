import React, { useState, useEffect, useRef } from "react"
import firebase from "firebase/app";
import "firebase/firestore";
import "../styles/global.css"
import 'date-fns';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  flexItem: {
    flex: "1 1 60%"
  },
}));

const OrderList = ({ orderItem }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [flag, setFlag] = useState([]);
  const [data, setData] = useState([]);
  const [items, setItems] = useState([]);
  const [alert, setAlert] = useState([]);
  const renderFlgRef = useRef(null);
  const classes = useStyles();

  useEffect(() => {
    const _data = Array.from(items);
    const [year, month, day] = selectedDate.toLocaleDateString().split("/");
    const key = year + "-" + ("0" + month).slice(-2);
    const unsubscribe = 
    firebase
      .firestore()
      .collection("transaction")
      .doc("monthly")
      .collection(key)
      .onSnapshot(snapshot => {
        
        let modDate = ""
        snapshot.docChanges().forEach(change => {
          const order = change.doc.data();
          const changeType = change.type
          const newOrder = { // snapshot.doc.mapではだめだった
            id: change.doc.id,
            orders: order.planName.split("\n").map((value) => value.split("×")),
            count: order.planName.split("\n").length,
            ...order,
          }
          if (changeType === "modified") {
            modDate = change.doc.data().reservationTime.split(' ')[0];
            const index = _data.findIndex(ord => ord.id === change.doc.id);
            _data[index] = newOrder
          } else if (changeType === "added") {
            _data.push(newOrder);
          } else {
            console.error("error: type not found.")
          }
        });
        setItems(_data.sort((a, b) => a.reservationTime < b.reservationTime ? -1 : 1));
        const newData = _data.filter(item => item.reservationTime.split(' ')[0] === (modDate ? modDate : zeroPadding(selectedDate.toLocaleDateString())));
        setData(newData);
        setFlag(newData.map(item => item.finished));
      });
    
    return () => unsubscribe();
  }, []);

  const updateAlert = () => {
    const now = new Date();
    let newAlert = [];
    data.forEach((item, i) => {
      const diff = new Date(item.reservationTime.replace(/-/g, "/")) - now;
      if (diff / (1000 * 60) <= 30.0 && !item.finished) {
        document.querySelector("#row-" + i).childNodes.forEach(el => el.style.backgroundColor = "rgb(255,193,7)");
        document.querySelectorAll(".row-sub" + i).forEach(el =>
          el.childNodes.forEach(item => item.style.backgroundColor = "rgb(255,193,7)")
        );
        newAlert[i] = true;
      }
    })
    setAlert(newAlert);
  }

  // 30分前のオーダーに赤背景をつける
  useEffect(() => {
    updateAlert();
    const timer = setInterval(() => {
      updateAlert();
    }, 1000 * 60);
    return () => clearInterval(timer);
  }, [data])

  useEffect(() => {
    if (renderFlgRef.current) {
      const newData = items.filter(item => item.reservationTime.split(' ')[0] === zeroPadding(selectedDate.toLocaleDateString()));
      setData(newData);
      setFlag(newData.map(item => item.finished));
    } else {
      renderFlgRef.current = true;
    }
  }, [selectedDate]);

  useEffect(() => {
    document.querySelectorAll(".finished").forEach((el, i) => {
      el.checked = flag[i];
    })
    const newAlert = [];
    flag.forEach((checked, i) => {
      if (checked) {
        document.querySelector("#row-" + i).childNodes.forEach(el => el.style.backgroundColor = "rgba(40, 255, 244, 0.4)");
        document.querySelectorAll(".row-sub" + i).forEach(el =>
          el.childNodes.forEach(item => item.style.backgroundColor = "rgba(40, 255, 244, 0.4)")
        );
        newAlert[i] = false;
      } else {
        const diff = new Date(data[i].reservationTime.replace(/-/g, "/")) - new Date();
        if (diff / (1000 * 60) <= 30.0) {
          document.querySelector("#row-" + i).childNodes.forEach(el => el.style.backgroundColor = "rgba(255,193,7)");
          document.querySelectorAll(".row-sub" + i).forEach(el =>
            el.childNodes.forEach(item => item.style.backgroundColor = "rgba(255,193,7)")
          );
          newAlert[i] = true;
        } else {
          document.querySelector("#row-" + i).childNodes.forEach(el => el.style.backgroundColor = "transparent");
          document.querySelectorAll(".row-sub" + i).forEach(el =>
            el.childNodes.forEach(item => item.style.backgroundColor = "transparent")
          );
        }
      }
    });
    setAlert(newAlert);
  }, [flag])

const sleep = (time) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const zeroPadding = (date) => {
    const [year, month, day] = date.split("/");
    return year + "-" + ("0" + month).slice(-2) + "-" + ("0" + day).slice(-2);
  }

  const updateFlag = (i) => {
    const [year, month, day] = selectedDate.toLocaleDateString().split("/");
    const key = year + "-" + ("0" + month).slice(-2)
    firebase.firestore().collection("transaction").doc("monthly").collection(key).doc(data[i].id).update({
      finished: !flag[i]
    });
    const newFlag = Array.from(flag);
    newFlag.splice(i, 1, !flag[i]);
    setFlag(newFlag);
  }

  return (
    <>
      <Box display="flex">
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <Grid container justifyContent="space-around"  className={classes.flexItem}>
            <KeyboardDatePicker
              disableToolbar
              variant="inline"
              format="yyyy-MM-dd"
              margin="normal"
              id="date-picker-inline"
              label="オーダー日"
              value={selectedDate}
              onChange={handleDateChange}
              KeyboardButtonProps={{
                'aria-label': 'change date',
              }}
            />
          </Grid>
        </MuiPickersUtilsProvider>

        <Box>
          <Typography variant="caption">
            30分前オーダー
          </Typography>
          <Typography color="secondary" variant="h3">{alert.filter(i => i).length}</Typography>
        </Box>
      </Box>
    <table className="tg">
      <tbody>
      <tr>
        <th>受渡し済</th>
        <th>時間</th>
        <th>メニュー名</th>
        <th>数</th>
        <th>値段</th>
        <th>顧客名<br />電話番号</th>
      </tr>
      </tbody>
      {data.map((item, i) => (
        <tbody key={item.id}>
          <tr id={"row-" + i}>
            <td rowspan={item.count}><input type="checkbox" class="finished" id={"finished" + i} style={{ paddingLeft: "auto" }} onClick={() => updateFlag(i)} /></td>
            <td rowspan={item.count}>{item.reservationTime}</td>
            <td>{item.orders[0][0]}</td>
            <td>{item.orders[0][1]}</td>
            <td rowspan={item.count}>{item.planPrice}</td>
            <td rowspan={item.count}>{item.userName}<br />{item.userTel}</td>
          </tr>
          {item.orders.slice(1).map((row, j) => (
            <tr key={j} class={"row-sub" + i}>
              <td>{row[0]}</td>
              <td>{row[1]}</td>
            </tr>
          ))}
        </tbody>
      ))}
      </table>
    </>
  )
}

export default OrderList
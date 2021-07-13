import React, { useState, useEffect } from "react";
import firebase from "firebase/app";
import "firebase/firestore";
import Container from "@material-ui/core/Container";
import { makeStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Button from "@material-ui/core/Button";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
const { Timestamp } = firebase.firestore;

const useStyles = makeStyles((theme) => ({
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  container: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingRight: 0,
    paddingLeft: 0,
  },
  root: {
    padding: 0,
  },
  itemList: {
    fontSize: 8,
    padding: 0,
  },
}));

const Transaction = () => {
  const date = new Date();
  const classes = useStyles();
  const LIMIT = 10;
  const [year, setYear] = useState(date.getFullYear());
  const [month, setMonth] = useState(date.getMonth() + 1);
  const [change, setChange] = useState(false);
  const [items, setItems] = useState([]);
  const [pageToken, setPageToken] = useState("");

  useEffect(() => {
    fetchData(year, month);
  }, [change]);

  useEffect(() => {
    setItems([]);
    setPageToken("");
    setChange(true);
  }, [month]);

  const moveCalendar = (e) => {
    if (e.target.id === "prev") {
      setMonth(month - 1);
      if (month <= 1) {
        setYear(year - 1);
        setMonth(12);
      }
    }

    if (e.target.id === "next") {
      setMonth(month + 1);
      if (month >= 12) {
        setYear(year + 1);
        setMonth(1);
      }
    }
  };

  const fetchData = async (year, month) => {
    setChange(false);
    const _month = ("0" + month).slice(-2);
    const key = `${year}-${_month}`;
    const data = await getAllData(LIMIT, key);
    let newItems = Array.from(items);
    newItems = newItems.concat(data.orders);
    setItems(newItems);
    setPageToken(data.nextPageToken);
  };

  const getAllData = async (limit, key) => {
    let query = firebase
      .firestore()
      .collection("transaction")
      .doc("monthly")
      .collection(key)
      .orderBy("timestamp", "desc")
      .limit(limit);
    const splitter = ":";

    if (pageToken !== "") {
      const [seconds, nanoseconds] = pageToken.split(splitter);
      const timestamp = new Timestamp(seconds, nanoseconds);
      query = query.startAfter(timestamp);
    }

    const querySnapshot = await query.get();
    const orders = [];
    await querySnapshot.forEach((doc) => {
      const order = doc.data();
      orders.push(order);
    });
    if (querySnapshot.docs.length < limit) {
      // limitより少なければ、次のデータはないとする ... limitと同値の時は次へが表示されてしまう
      return { orders, nextPageToken: "" };
    }

    const last = querySnapshot.docs[querySnapshot.docs.length - 1];
    const lastData = last.data();
    const time = lastData.timestamp;
    let nextToken = `${time.seconds}${splitter}${time.nanoseconds}`;
    return { orders, nextPageToken: nextToken };
  };

  return (
    <>
      <button id="prev" type="button" onClick={(e) => moveCalendar(e)}>
        前の月
      </button>
      <button id="next" type="button" onClick={(e) => moveCalendar(e)}>
        次の月
      </button>
      <Container class={classes.container}>
        <h4>
          {year}-{("0" + month).slice(-2)}
        </h4>
        {items.map((item) => {
          return (
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography className={classes.heading}>
                  {item.createdAt}
                  <br />
                  販売額: ¥ {parseInt(item.planPrice, 10).toLocaleString()}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List className={classes.root}>
                  {item.planName
                    .split("\n")
                    .map((value) => value.split("×"))
                    .map((row, idx) => {
                      return (
                        <ListItem
                          key={`item-${pageToken}-${idx}`}
                          className={classes.itemList}
                        >
                          <ListItemText
                            primary={
                              <Typography type="body2">
                                {idx + 1} {row[0] + " " + row[1] + "点"}
                              </Typography>
                            }
                          />
                        </ListItem>
                      );
                    })}
                </List>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Container>
      {pageToken && (
        <Button
          onClick={fetchData}
          style={{ backgroundColor: "#f2f2f2", border: "1px solid #333" }}
        >
          MORE
        </Button>
      )}
    </>
  );
};

export default Transaction;

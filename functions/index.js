const functions = require("firebase-functions");
const admin = require("firebase-admin");
const rp = require("request-promise");

admin.initializeApp();
const db = admin.firestore();
const request = rp.defaults({ simple: false });

const FIRESTORE_COLLECTION = "transaction";
const now = new Date(new Date().getTime() + 3600000 * 9);
// const key =
//   now.getFullYear() +
//   "-" +
//   ("0" + (parseInt(now.getMonth(), 10) + 1)).slice(-2);
const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN;

exports.lineNotify = functions.firestore
  .document(FIRESTORE_COLLECTION + "/monthly/{key}/{doc}")
  .onCreate((snap, context) => {
    // line へ通知
    const orders = snap
      .data()
      .planName.split("\n")
      .map((value) => value.split("×").join(" "))
      .join("\n");
    const time = snap.data().reservationTime;
    const name = snap.data().userName;
    const tel = snap.data().userTel;
    request({
      uri: "https://notify-api.line.me/api/notify",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Bearer " + LINE_ACCESS_TOKEN,
      },
      form: {
        message:
          "\n" +
          time +
          " に、\n" +
          orders +
          "\n\nお名前: " +
          name +
          "\n電話番号: " +
          tel,
      },
    })
      .then(function (response) {
        // 成功時 (3XX)
        // LINE Notify からのレスポンスを Functions のログに出力
        console.log("User has %d repos", response.length);
        console.log("response :" + response);
        return null;
      })
      .catch(function (err) {
        // 失敗時 (4XX or 5XX)
        Error(err);
      });
    return null;
  });

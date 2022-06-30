# 概要

飲食店での LINE を活用したテイクアウトオーダーシステムの管理画面

## 技術スタック

フロントエンドは、Gatsby Default Starter を用いて構築。DB は、Firebase Firestore Database を採用した。
DBの特定のコレクションに値が追加されると、Firebase Functionsが発火し、LINEに通知が届く。

## 機能

販売数管理、メニュー一覧の表示、オーダー履歴の表示、LINE通知

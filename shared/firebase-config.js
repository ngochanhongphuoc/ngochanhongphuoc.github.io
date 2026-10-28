// Cấu hình Firebase cho game chơi chung (/quiz + /quiz/join).
// Cách lấy: xem file docs/firebase-setup.txt trong cùng thư mục.
// Firebase Console > Project settings > Your apps > Web app > SDK setup and configuration > Config
// apiKey của Firebase web là công khai; dữ liệu được bảo vệ bằng luật trong database.rules.json.
window.FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDPArdSKckzN4TeEuNBw0k37xXLW2cvyhk',
  authDomain: 'wedding-game-acf62.firebaseapp.com',
  databaseURL: 'https://wedding-game-acf62-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'wedding-game-acf62',
  storageBucket: 'wedding-game-acf62.firebasestorage.app',
  messagingSenderId: '232486694412',
  appId: '1:232486694412:web:4aa1d97c8fad85677bc829',
};

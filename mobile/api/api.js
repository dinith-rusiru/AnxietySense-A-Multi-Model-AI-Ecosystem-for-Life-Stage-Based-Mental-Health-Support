// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://10.0.2.2:8000", // Android Emulator → PC
//   // use http://127.0.0.1:8000 for web
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// export const predictScore = (features) =>
//   API.post("/predict", { features });

// export default API;


// import axios from "axios";

/*
  BASE URL GUIDE:
  ----------------
  Android Emulator : http://10.0.2.2:8000
  Web (Browser)    : http://127.0.0.1:8000
  Real Device      : http://<PC-IP>:8000
*/

// const API = axios.create({
//   baseURL: "http://10.0.2.2:8000",
//   timeout: 10000,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// /**
//  * Predict Total Score & Anxiety Level
//  * @param {Object} features - Q1 to Q31 values
//  */
// export const predictScore = async (features) => {
//   return API.post("/predict", {
//     features,
//   });
// };

// export default API;

import axios from "axios";

const API = axios.create({
  baseURL: "http://10.0.2.2:8000", // Android emulator
  headers: {
    "Content-Type": "application/json",
  },
});

export const predictScore = (answers) => {
  return API.post("/predict", {
    features: answers, // THIS IS THE KEY FIX
  });
};

export default API;

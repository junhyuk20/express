const express = require("express"); // express모듈은 함수고 (개인적인생각)
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config(); //.env에서 설정한 값들을 모두 적용시키려면 맨 위에다가!

const app = express(); // express함수를 호출하고 return 값들을 사용 할 수 있음 (개인적인 생각)
app.set("port", process.env.PORT || 3000);

app.use(morgan("common")); // combined(배포 후), common, short, tiny, dev(개발할 때)
app.use("/", express.static(path.join(__dirname, "public")));

app.use(express.json()); // 이녀석과 아래녀석이 요청의 본문에 데이터를 해석해서 req.body 형태로 만들어줌 (폼 데이터 OR ajax 데이터)
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET)); // 요청문에서 보낸 cookie를 해석 후 req.cookie 객체로 만듬, 유효기간 만료된 쿠키는 알아서 거름
app.use(
  session({
    resave: false, //요청이 올 때 세션 수정사항이 생기지 않더라도 세션을 다시 저장할 거냐 ?
    saveUninitialized: false, // 세션에 저장할 내역이 없더라도 처음부터 세션을 생성할지 설정  하는거
    secret: process.env.COOKIE_SECRET, // 쿠키서명 cookieParser에 준 인수와 같은 녀석이여야 쿠키파서가 해석할 수 있음
    cookie: {
      httpOnly: true, //클라이언트 에서 쿠키확인 불가능하게
      secure: false, //https가 아닌 환경에서도 사용할수 있게 false, 배포시에는 https로 배포하고 true로 변경
    },
    name: "session-cookie", // 세션쿠키 이름 설정, 기본은 connect.sid
  })
);

//모든경로 적용 미들웨어
app.use((req, res, next) => {
  console.log(` 미들웨어 테스트 ! `);
  next();
});
//특정 url로 들어오는 녀석 미들웨어
app.use("/", (req, res, next) => {
  console.log(`경로포함한 미들웨어 테스트 진행! `);
  next();
});
// 미들웨어 연달아 사용
app.get(
  "/",
  (req, res, next) => {
    console.log("GET / 요청에서만 실행됩니다.");
    next();
  },
  (req, res) => {
    throw new Error(`에러는 에러 처리 미들웨어로 갑니다.`);
  }
);
//에러처리 미들웨어
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(err.message);
});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), `번 포트에서 대기중!`);
});

// 테스트코드
const should = require("should");
const express = require("express");
const cookieParser = require("cookie-parser");
const request = require("supertest");
const app = require("../../index");
const models = require("../../models/index");
const { getUserByUserId } = require("../user/user.ctrl");
const createAccessToken = require("./utils/createAccessToken");
const bcrypt = require("bcrypt");

describe("Set up Database", () => {
  const users = [
    {
      userId: "test1",
      password: "helloworld123!",
      nickname: "test1_nickname",
    },
    {
      userId: "test2",
      password: "helloworld123!",
      nickname: "test2_nickname",
    },
    {
      userId: "test3",
      password: "helloworld123!",
      nickname: "test3_nickname",
    },
    {
      userId: "test7",
      password: "helloworld123!",
      nickname: "test7_nickname",
    },
  ];
  beforeEach("setting middleware", () => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
  });

  beforeEach("sync DB", (done) => {
    models.sequelize.sync({ force: true }).then(() => {
      done();
    });
  });

  for (const user of users) {
    beforeEach("insert data", (done) => {
      request(app).post("/users").send(user).end(done);
    });
  }

  describe("GET /users/:id", () => {
    describe("성공시", () => {
      it("id가 1인 유저 객체를 반환한다", (done) => {
        request(app)
          .get("/users/1")
          .end((err, res) => {
            res.body.should.have.property("id", 1);
            done();
          });
      });
    });

    describe("실패시", () => {
      it("id가 숫자가 아닐 경우 400을 응답한다", (done) => {
        request(app).get("/users/one").expect(400).end(done);
      });
      it("id로 유저를 찾을 수 없을 경우 404를 응답한다", (done) => {
        request(app).get("/users/111").expect(404).end(done);
      });
    });
  });

  describe("DELETE /users/:id", () => {
    describe("성공시", () => {
      it("204를 응답한다", (done) => {
        request(app).delete("/users/1").expect(204).end(done);
      });
    });

    describe("실패시", () => {
      it("id가 숫자가 아닐 경우 400으로 응답한다", (done) => {
        request(app).delete("/users/one").expect(400).end(done);
      });

      it("id로 유저를 찾을 수 없을 경우 404를 응답한다", (done) => {
        request(app).delete("/users/1111").expect(404).end(done);
      });
    });
  });

  describe("POST /users 회원가입", () => {
    const user = {
      userId: "test4",
      password: "helloworld123!",
      nickname: "test4_nickname",
    };
    let body;
    let statusCode;
    before("create new user", (done) => {
      request(app)
        .post("/users")
        .send(user)
        .end((err, res) => {
          body = res.body;
          statusCode = res.status;
          done();
        });
    });
    describe("성공시", () => {
      it("createHashedPassword를 통해 비밀번호는 암호화되어 저장되어야한다", () => {
        body.isCreated.should.be.true();
      });

      it("회원가입에 성공시 201을 반환한다", () => {
        statusCode.should.equal(201, statusCode);
      });

      it("userId 중복확인을 통과한 경우 204를 응답한다", (done) => {
        request(app)
          .post("/users/validationCheck")
          .send({ userId: "randomUserId" })
          .expect(204)
          .end(done);
      });

      it("nickname 중복확인을 통과한 경우 204를 응답한다", (done) => {
        request(app)
          .post("/users/validationCheck")
          .send({ nickname: "randomNickname" })
          .expect(204)
          .end(done);
      });
    });
    describe("실패시", () => {
      it("userId, password, nickname 중 하나라도 없는 경우 400을 응답한다", (done) => {
        request(app).post("/users").send({}).expect(400).end(done);
      });

      it("userId가 사용중인 경우 409를 응답한다", (done) => {
        request(app)
          .post("/users/validationCheck")
          .send({
            userId: "test1",
          })
          .expect(409)
          .end(done);
      });

      it("nickname이 사용중인 경우 409를 응답한다", (done) => {
        request(app)
          .post("/users/validationCheck")
          .send({ nickname: "test1_nickname" })
          .expect(409)
          .end(done);
      });
    });
  });

  describe("POST /users/login 로그인", () => {
    let hashedPassword;

    const user = {
      userId: "test5",
      password: "helloworld123!",
      nickname: "test5_nickname",
    };
    beforeEach("create new user", (done) => {
      request(app).post("/users").send(user).end(done);
    });

    before("get existing user's hashed password", (done) => {
      models.User.findOne({
        attributes: ["password"],
        where: {
          userId: user.userId,
        },
      }).then((user) => {
        hashedPassword = user.password;
      });
      done();
    });
    describe("성공시", () => {
      let accessToken;
      it("getUserByUserId는 userId와 일치하는 유저 객체를 반환한다", async () => {
        const existingUser = await getUserByUserId(user.userId);
        existingUser.should.have.property("userId", user.userId);
      });

      it("comparePasswords는 입력받은 비밀번호와 저장된 비밀번호를 비교해 true를 반환한다", async () => {
        bcrypt.compare(user.password, hashedPassword).then((res) => {
          res.should.be.true();
        });
      });
      it("createAccessToken 함수는 유저데이터를 기반으로 accessToken을 생성한다", () => {
        accessToken = createAccessToken(user);
        accessToken.should.be.ok();
      });
    });

    describe("실패시", () => {
      const notExistingUserId = 111;
      it("loginHandler는 userId 또는 password가 없을 경우 400을 응답한다", (done) => {
        request(app)
          .post("/users/login")
          .send({ userId: "hello" })
          .expect(400)
          .end(done);
      });

      it("getUserById 함수는 일치하는 userId가 없는 경우 null을 반환한다", async () => {
        const existingUser = await getUserByUserId(notExistingUserId);

        should.equal(null, existingUser);
      });

      it("loginHandler는 일치하는 userId가 없는 경우 400을 반환한다", (done) => {
        request(app)
          .post("/users/login")
          .send({ userId: notExistingUserId, password: "helloworld123!" })
          .expect(400)
          .end(done);
      });

      it("comparePasswords 함수는 두 비밀번호가 일치하지 않는 경우 400을 응답한다", (done) => {
        request(app)
          .post("/users/login")
          .send({
            userId: user.userId,
            password: "wrongPassword",
          })
          .end((err, res) => {
            res.body.isLogin.should.not.be.true();
            done();
          });
      });
    });
  });

  describe("PATCH /users/:id", () => {
    const userId = "test1_patched";
    const password = "helloworld123!_patched";
    const nickname = "test1_nickname_patched";
    describe("성공시", () => {
      it("userId 변경 성공시 204를 응답한다", (done) => {
        request(app).patch("/users/1").send({ userId }).expect(204).end(done);
      });
      it("비밀번호 변경 성공시 204를 응답한다", (done) => {
        request(app).patch("/users/1").send({ password }).expect(204).end(done);
      });
      it("nickname 변경 성공시 204를 응답한다", (done) => {
        request(app).patch("/users/1").send({ nickname }).expect(204).end(done);
      });
    });

    describe("실패시", () => {
      it("id가 숫자가 아닐 경우 400을 응답한다", (done) => {
        request(app).patch("/users/one").send({ userId }).expect(400).end(done);
      });
      it("id로 유저를 찾을 수 없는 경우 404를 응답한다", (done) => {
        request(app).patch("/users/111").send({ userId }).expect(404).end(done);
      });
      it("userId, password, nickname 모두 없는 경우 400을 응답한다", (done) => {
        request(app).patch("/users/1").send({}).expect(400).end(done);
      });
    });
  });
});

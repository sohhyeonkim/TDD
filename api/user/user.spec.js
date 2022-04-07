// 테스트코드
const should = require("should");
const request = require("supertest");
const app = require("../../index");
const models = require("../../models");
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
  ];
  beforeEach("sync DB", (done) => {
    models.sequelize.sync({ force: true }).then(() => {
      done();
    });
  });
  beforeEach("bulk insert data", (done) => {
    models.User.bulkCreate(users);
    done();
  });

  describe("GET /users", () => {
    describe("성공시", () => {
      it("유저 객체를 담은 배열을 반환한다", (done) => {
        request(app)
          .get("/users")
          .end((err, res) => {
            res.body.should.be.instanceOf(Array);
            done();
          });
      });

      it("최대 limit 개수만큼 반환한다", (done) => {
        request(app)
          .get("/users?limit=2")
          .end((err, res) => {
            res.body.should.have.lengthOf(2);
            done();
          });
      });
    });

    describe("실패시", () => {
      it("limit이 숫자형이 아니면 400을 응답한다", (done) => {
        request(app).get("/users?limit=two").expect(400).end(done);
      });
    });
  });

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

  describe("POST /users", () => {
    const user = {
      userId: "test4",
      password: "helloworld123!",
      nickname: "test4_nickname",
    };
    let body;
    before("create new user", (done) => {
      models.User.create(user).then((data) => {
        body = data;
        done();
      });
    });
    describe("성공시", () => {
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
      it("회원가입에 성공한 객체를 반환한다", () => {
        body.should.have.property("userId", user.userId);
        body.should.have.property("password", user.password);
        body.should.have.property("nickname", user.nickname);
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

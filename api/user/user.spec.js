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
    });
  });
});

// describe("suite1", () => {
//   before(() => console.log("before1")); // 1
//   beforeEach(() => console.log("beforeEach1")); // 3, 5
//   after(() => console.log("after"));
//   afterEach(() => console.log("afterEach"));
//   it("test1", () => console.log("test1"));
//   it("test2", () => console.log("test2"));
// });

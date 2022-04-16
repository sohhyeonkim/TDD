const should = require("should");
const request = require("supertest");
const express = require("express");
const app = require("../../index");
const models = require("../../models/index");
const path = require("path");

describe("Set up Database", () => {
  const users = [
    {
      userId: "test1",
      password: "hello",
      nickname: "test1_nickname",
    },
    {
      userId: "test2",
      password: "hello",
      nickname: "test2_nickname",
    },
  ];
  beforeEach("sync DB", (done) => {
    models.sequelize.sync({ force: true }).then(() => {
      console.log("sync DB");
      done();
    });
  });
  for (const user of users) {
    beforeEach("insert user", (done) => {
      request(app).post("/users").send(user).end(done);
    });
  }

  describe("POST  /posts", () => {
    describe("성공시", () => {
      it("isUploaded가 true이고, imgUrl에 s3버킷 주소가 저장된 객체를 반환한다", (done) => {
        request(app)
          .post("/posts")
          .set("id", "1")
          .field("content", "test content")
          .attach("image", __dirname + "/testImages/lt4mb.jpg")
          .end((err, res) => {
            if (err) {
              console.log(err);
            }
            res.body.should.be.instanceOf(Object);
            res.body.isUploaded.should.be.true();
            should.exist(res.body.imgUrl);
            done();
          });
      });
    });
    describe("실패시", () => {
      it("이미지 용량이 4MB 이상인 경우 에러를 응답한다", (done) => {
        request(app)
          .post("/posts")
          .set("id", "1")
          .attach("image", __dirname + "/testImages/gt4mb.png")
          .end((err, res) => {
            res.body.should.have.property("name", "MulterError");
            done();
          });
      });
      it("content가 없는 경우 400을 응답한다", (done) => {
        request(app)
          .post("/posts")
          .set("id", "1")
          .attach("image", __dirname + "/testImages/lt4mb.jpg")
          .expect(400)
          .end(done);
      });

      it("유효하지 않는 userId인 경우 403을 응답한다", (done) => {
        request(app)
          .post("/posts")
          .set("id", "11111")
          .field("content", "test content")
          .attach("image", __dirname + "/testImages/lt4mb.jpg")
          .expect(403)
          .end(done);
      });
    });
  });

  describe("DELETE /posts", () => {
    let fileKey;
    beforeEach("create Post", (done) => {
      request(app)
        .post("/posts")
        .set("id", "2")
        .field("content", "test content")
        .attach("image", __dirname + "/testImages/lt4mb.png")
        .end((err, res) => {
          fileKey = res.body.imgUrl;
          done();
        });
    });

    describe("성공시", () => {
      it("s3객체와 DB 데이터 삭제한 경우 204를 응답한다", (done) => {
        request(app)
          .delete("/posts/1")
          .set("id", "2")
          .send({
            fileKey,
          })
          .expect(204)
          .end(done);
      });
    });

    describe("실패시", () => {
      it("postId가 숫자가 아닌 경우 400을 응답한다", (done) => {
        request(app).delete("/posts/one").expect(400).end(done);
      });

      it("유효하지 않는 userId인 경우 403을 응답한다", (done) => {
        request(app).delete("/posts/1").set("id", "1111").expect(403).end(done);
      });
      it("유효하지 않은 postId인 경우 400을 응답한다", (done) => {
        request(app)
          .delete("/posts/1111111111111")
          .set("id", "2")
          .send({
            fileKey,
          })
          .expect(400)
          .end(done);
      });
      it("유효하지 않은 fileKey인 경우", (done) => {
        request(app)
          .delete("/posts/1")
          .set("id", "2")
          .send({
            fileKey:
              "https://tddimgs.s3.ap-northeast-2.amazonaws.notexistingkey.png",
          })
          .end((err, res) => {
            res.body.should.have.property("name", "MissingRequiredParameter");
            done();
          });
      });
    });
  });
});

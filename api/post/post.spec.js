const should = require("should");
const request = require("supertest");
const express = require("express");
const app = require("../../index");
const models = require("../../models/index");
const path = require("path");

describe("Set up Database", () => {
  const user = {
    userId: "test1",
    password: "hello",
    nickname: "test1_nickname",
  };
  beforeEach("sync DB", (done) => {
    models.sequelize.sync({ force: true }).then(() => {
      console.log("sync DB");
      done();
    });
  });
  beforeEach("insert user", (done) => {
    request(app).post("/users").send(user).end(done);
  });
  describe("POST  /posts", () => {
    describe("성공시", () => {
      it("isUploaded가 true이고, imgUrl에 s3버킷 주소가 저장된 객체를 반환한다", (done) => {
        request(app)
          .post("/posts")
          .set("id", "1")
          .field("content", "test content")
          .attach("image", __dirname + "/testImages/testImg.jpg")
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
      it("content가 없는 경우 400을 응답한다", (done) => {
        request(app)
          .post("/posts")
          .set("id", "1")
          .attach("image", __dirname + "/testImages/testImg.jpg")
          .expect(400)
          .end(done);
      });

      it("유효하지 않는 userId인 경우 403을 응답한다", (done) => {
        request(app)
          .post("/posts")
          .set("id", "11111")
          .field("content", "test content")
          .attach("image", __dirname + "/testImages/testImg.jpg")
          .expect(403)
          .end(done);
      });
    });
  });
});

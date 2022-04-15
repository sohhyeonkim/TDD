const should = require("should");
const request = require("supertest");
const express = require("express");
const app = require("../../index");
const models = require("../../models/index");
const cookieParser = require("cookie-parser");

describe("Set up Database", () => {
  const user = {
    userId: "test1",
    password: "helloworld123!",
    nickname: "test1_nickname",
  };
  const post = {
    content: "test content",
    img: "https://tddimgs.s3.ap-northeast-2.amazonaws.com/5631650031288293.png",
  };

  beforeEach("insert data", (done) => {
    request(app).post("/users").send(user).end(done);
  });

  describe("POST  /posts", () => {
    describe("성공시", () => {
      it("isUploaded와 imgUrl이 저장된 객체를 반환한다", (done) => {
        post.UserId = 1;
        request(app)
          .post("/posts")
          .send(post)
          .end((err, res) => {
            res.body.isUploaded.should.be.true();
            should.exist(res.body.imgUrl);
          });
      });
    });

    describe("실패시", () => {
      it("req.body.content가 없다면 400을 응답한다", (done) => {
        request(app).post("/posts").send({}).expect(400).end(done);
      });
      it("UserId가 유효하지 않은 경우, ", (done) => {
        post.UserId = 111;
        request(app).post("/posts").send(post).expect(403).end(done);
      });
    });
  });
});

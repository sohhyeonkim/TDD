const should = require("should");
const request = require("supertest");
const express = require("express");
const app = require("../../index");
const models = require("../../models/index");

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

  describe.only("GET /posts", () => {
    let fileKey;
    const content = "test content";
    beforeEach("create Post", (done) => {
      request(app)
        .post("/posts")
        .set("id", "1")
        .field("content", content)
        .attach("image", __dirname + "/testImages/lt4mb.png")
        .end((err, res) => {
          fileKey = res.body.imgUrl;
          done();
        });
    });
    describe("성공시", () => {
      it("모든 게시물 조회시 게시물 객체들이 배열에 저장되어 반환한다", (done) => {
        request(app)
          .get("/posts")
          .end((err, res) => {
            res.body.should.be.instanceOf(Array);
            res.body[0].should.have.property("content", content);
            res.body[0].should.have.property("img", fileKey);
            res.body[0].should.have.property("UserId", 1);
            done();
          });
      });

      it("id로 특정 게시물 조회시 params와 일치하는 id의 게시물 객체를 반환한다", (done) => {
        request(app)
          .get("/posts/1")
          .end((err, res) => {
            res.body.should.be.instanceOf(Object);
            res.body.should.have.property("id", 1);
            done();
          });
      });
    });
    describe("실패시", () => {
      it("postId가 숫자가 아닌 경우 400을 응답한다", (done) => {
        request(app).get("/posts/one").expect(400).end(done);
      });
      it("유효하지 않은 postId인 경우 400을 응답한다", (done) => {
        request(app)
          .get("/posts/1111")
          .end((err, res) => {
            should.equal(res.body.message, "invalid postId");
            done();
          });
      });
    });
  });

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
        request(app)
          .delete("/posts/one")
          .send({
            fileKey,
          })
          .expect(400)
          .end(done);
      });

      it("유효하지 않는 userId인 경우 403을 응답한다", (done) => {
        request(app)
          .delete("/posts/1")
          .set("id", "1111")
          .send({
            fileKey,
          })
          .expect(403)
          .end(done);
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

  describe("PATCH /posts", () => {
    let fileKey;
    beforeEach("create Post", (done) => {
      request(app)
        .post("/posts")
        .set("id", "1")
        .field("content", "test content")
        .attach("image", __dirname + "/testImages/lt4mb.png")
        .end((err, res) => {
          fileKey = res.body.imgUrl;
          done();
        });
    });
    describe("성공시", () => {
      it("콘텐츠만 변경한 경우 'content updated'을 응답한다", (done) => {
        request(app)
          .patch("/posts/1")
          .set("id", "1")
          .field("content", "content to update")
          .end((err, res) => {
            should.equal(res.body.message, "content updated");
            done();
          });
      });
      it("이미지만 변경한 경우 'image updated'를 응답한다", (done) => {
        request(app)
          .patch("/posts/1")
          .set("id", "1")
          .attach("image", __dirname + "/testImages/lt4mb.jpg")
          .field("fileKey", fileKey)
          .end((err, res) => {
            should.equal(res.body.message, "image updated");
            done();
          });
      });
      it("이미지와 콘텐츠를 모두 변경한 경우 'post updated'를 응답한다", (done) => {
        request(app)
          .patch("/posts/1")
          .set("id", "1")
          .field("content", "content to update2")
          .field("fileKey", fileKey)
          .attach("image", __dirname + "/testImages/lt4mb2.png")
          .end((err, res) => {
            should.equal(res.body.message, "post updated");
            done();
          });
      });
    });

    describe("실패시", () => {
      it("postId가 숫자가 아닌 경우 400을 응답한다", (done) => {
        request(app).patch("/posts/one").expect(400).end(done);
      });
      it("유효하지 않은 postId인 경우 'invalid postId'를 응답한다", (done) => {
        request(app)
          .patch("/posts/1111")
          .set("id", "1")
          .field("content", "content to update")
          .end((err, res) => {
            should.equal(res.body.message, "invalid postId");
            done();
          });
      });
      it("이미지를 변경한 경우 fileKey가 없으면 's3 object deletion failed'를 응답한다", (done) => {
        request(app)
          .patch("/posts/1")
          .set("id", "1")
          .attach("image", __dirname + "/testImages/lt4mb2.png")
          .end((err, res) => {
            should.equal(res.body.message, "s3 object deletion failed");
            done();
          });
      });
      it("콘텐츠와 이미지 모두 없는 경우 400을 응답한다", (done) => {
        request(app)
          .patch("/posts/1")
          .set("id", "1")
          .end((err, res) => {
            should.equal(
              res.body.message,
              "게시물 patch 요청에서 바디와 이미지 파일이 모두 없음"
            );
            done();
          });
      });
    });
  });
});

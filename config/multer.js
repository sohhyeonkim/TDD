const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
require("dotenv").config();

const s3 = new aws.S3({
  accessKeyId: process.env.S3_ACCESSKEYID,
  secretAccessKey: process.env.S3_SECRETKEY,
  region: process.env.S3_REGION,
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket:
      process.env.NODE_ENV !== "test"
        ? process.env.S3_BUCKETNAME
        : process.env.S3_TESTBUCKETNAME,
    acl: "public-read",
    key: function (req, file, cb) {
      cb(
        null,
        Math.floor(Math.random() * 1000).toString() +
          Date.now() +
          "." +
          file.originalname.split(".").pop()
      );
    },
  }),
  limits: {
    fileSize: 4 * 1024 * 1024,
  },
});

module.exports = upload;

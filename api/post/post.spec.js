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
});

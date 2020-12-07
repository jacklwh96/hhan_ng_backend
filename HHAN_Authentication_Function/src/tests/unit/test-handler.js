const axios = require("axios");
const app = require("../../app.js");
const chai = require("chai");
const chaiHttp = require("chai-http");
const request = require("request-promise-native");
const expect = chai.expect;

const BASE_URL =
  "https://a8y4erydnd.execute-api.us-east-1.amazonaws.com/default/HHAN_Authentication_Function";

const wrongParams = {
  username: "migrationtest",
  password: "F988C245B3C789A608B34CD1B7C1B612542DBD0",
};

const correctParams = {
  username: "temptest",
  password: "30493F3845E4C10629BB023487829BA382C5CA24",
};

const wrongPostOptions = {
  method: "POST",
  uri: BASE_URL,
  form: JSON.stringify(wrongParams),
};

const correctPostOptions = {
  method: "POST",
  uri: BASE_URL,
  form: JSON.stringify(correctParams),
};

// testing for a particular error
it("Testing with Wrong Credentials, should expect 400 error", async () => {
  let error;
  try {
    await request(wrongPostOptions);
  } catch (err) {
    error = err;
  }
  expect(error.statusCode).to.equal(400);
  expect(error.name).to.equal("StatusCodeError");
});

it("Testing with correct Credentials, should expect 200 code", async () => {
  let res;
  let error;
  try {
    const response = await request(correctPostOptions);
    res = JSON.parse(response);
  } catch (err) {
    error = err;
  }
  expect(res.statusCode).to.equal(200);
  expect(res.error).to.equal("");
});

it("Testing with failed Credentials, should expect 502 error", async () => {
  let error;
  try {
    await request(BASE_URL);
  } catch (err) {
    error = err;
  }
  expect(error.statusCode).to.equal(502);
  expect(error.name).to.equal("StatusCodeError");
});

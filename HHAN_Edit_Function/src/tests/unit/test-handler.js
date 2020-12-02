"use strict";
const chai = require("chai");
const request = require("request-promise-native");
const expect = chai.expect;

const BASE_URL =
  "https://go6r6bjy02.execute-api.us-east-1.amazonaws.com/default/HHAN_Edit_Function";

const wrongParams = {
  user: {
    AccessToken: "",
    PreviousPassword: "F988C245B3C789A608B34CD1B7C1B612542DBD09",
    ProposedPassword: "F988C245B3C789A608B34CD1B7C1B612542DBD00",
  },
};

const failedParams = {
  username: "migrationtest",
  password: "F988C245B3C789A608B34CD1B7C1B612542DBD0",
};

const wrongPostOptions = {
  method: "POST",
  uri: BASE_URL,
  form: JSON.stringify(wrongParams),
};

const failedPostOptions = {
  method: "POST",
  uri: BASE_URL,
  form: JSON.stringify(failedParams),
};

// testing for a particular error
it("Testing with Wrong params, should expect 500 error", async () => {
  let error;
  try {
    await request(wrongPostOptions);
  } catch (err) {
    error = err;
  }
  expect(error.statusCode).to.equal(500);
  expect(error.name).to.equal("StatusCodeError");
});

it("Testing with failed params, should expect 502 error", async () => {
  let error;
  try {
    await request(failedPostOptions);
  } catch (err) {
    error = err;
  }
  expect(error.statusCode).to.equal(502);
  expect(error.name).to.equal("StatusCodeError");
});

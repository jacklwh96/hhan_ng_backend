const chai = require("chai");
const request = require("request-promise-native");
const expect = chai.expect;

const BASE_URL =
  "https://qvm3zj5lc4.execute-api.us-east-1.amazonaws.com/default/HHAN_Migration_Function";

const wrongParams = {
  user: {
    username: "migrationtest",
    password: "F988C245B3C789A608B34CD1B7C1B612542DBD0",
  },
  type: "MIGRATION",
};

const failedParams = {
  username: "migrationtest",
  password: "F988C245B3C789A608B34CD1B7C1B612542DBD0",
};

const correctParams = {
  user: {
    username: "MochaLambdaTest",
    password: "12345678",
    firstname: "",
    lastname: "",
    phonenum: "",
    id: "",
    isadmin: "",
    organization: "",
    title: "",
    degree: "",
    altemail: "",
    workemail: "",
    xlsuploadpriv: "",
  },
  type: "MIGRATION",
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

const correctPostOptions = {
  method: "POST",
  uri: BASE_URL,
  form: JSON.stringify(correctParams),
};

// testing for a particular error
it("Testing with Wrong Credentials, should expect 500 error", async () => {
  let error;
  try {
    await request(wrongPostOptions);
  } catch (err) {
    error = err;
  }
  expect(error.statusCode).to.equal(500);
  expect(error.name).to.equal("StatusCodeError");
});

it("Testing with failed Credentials, should expect 502 error", async () => {
  let error;
  try {
    await request(failedPostOptions);
  } catch (err) {
    error = err;
  }
  expect(error.statusCode).to.equal(502);
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
  expect(res.error).to.be.undefined;
});

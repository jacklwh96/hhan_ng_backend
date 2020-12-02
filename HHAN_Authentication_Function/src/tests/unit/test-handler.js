"use strict";

const app = require("../../app.js");
const chai = require("chai");
const expect = chai.expect;
var context, callback;

const event = {
  username: "wllau",
  password: "A342BD144D5EAFBCC3D8E66E00BF3A5F78AB4FE9",
};

describe("Tests Authentication success", () => {
  it("verifies successful response", async () => {
    const result = await app.handler(event, context, callback);

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(200);
    expect(result.body).to.be.an("string");

    let response = JSON.parse(result.body);

    expect(response).to.be.an("object");
    // expect(response.message).to.be.equal("hello world");
    // expect(response.location).to.be.an("string");
  });
});

describe("Tests Authentication fail", () => {
  it("verifies successful response", async () => {
    const result = await app.handler(event, context, callback);

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(200);
    expect(result.body).to.be.an("string");

    let response = JSON.parse(result.body);

    expect(response).to.be.an("object");
    // expect(response.message).to.be.equal("hello world");
    // expect(response.location).to.be.an("string");
  });
});

"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  testJobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */
describe("POST /jobs", function () {
    const newJob = {
        title: "new",
        salary: 123456,
        equity: "0.5",
        id: expect.any(Number),
        company_handle: "c1",
      };
  
    test("created new job", async function () {
      const resp = await request(app)
          .post("/jobs")
          .send(newJob)
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(201);
      expect(resp.body).toEqual({
        job: newJob,
      });
    });
  
    test("bad request with missing data", async function () {
      const resp = await request(app)
          .post("/jobs")
          .send({
            title: "new2",
            salary: 123456,
          })
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(400);
    });
  
    test("bad request with invalid data", async function () {
      const resp = await request(app)
          .post("/jobs")
          .send({
            title: "new",
            salary: "123456",
            equity: "0.5",
            company_handle: "c1",
          })
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(400);
    });
  });

/************************************** GET /jobs & Filter*/
describe("GET /jobs", function () {
    const newJob = {
        title: "new",
        salary: 123456,
        equity: "0.5",
        company_handle: "c1",
      };
  
    test("GET all", async function () {
      const resp = await request(app).get("/jobs/?title=jobTitle")
      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        jobs: [{
            title: 'jobTitle', 
            salary: 100000, 
            equity: '0.5', 
            company_handle: 'c1'}]
      });
    });
    test("validator fail: wrong query type", async function () {
        const resp = await request(app).get("/jobs/?salary='notNum'")
        expect(resp.statusCode).toEqual(400);
    })
    test("validator fail: wrong query name", async function () {
        const resp = await request(app).get("/jobs/?BAD='notThere'")
        expect(resp.statusCode).toEqual(400);
    })
    test("filter results", async function () {
        const resp = await request(app).get("/jobs/?title=jobTitle")
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            jobs: [{
                title: 'jobTitle', 
                salary: 100000, 
                equity: '0.5', 
                company_handle: 'c1'}]
          });
    })
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
    test("works for admin", async function () {
        console.log("the iDS ----------", testJobIds)
      const resp = await request(app)
          .patch(`/jobs/${testJobIds[0]}`)
          .send({
            title: "J-New",
          })
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.body).toEqual({
        job: {
          id: expect.any(Number),
          title: "J-New",
          salary: 1,
          equity: "0.1",
          company_handle: "c1",
        },
      });
    });
  
    test("unauth for others", async function () {
      const resp = await request(app)
          .patch(`/jobs/${testJobIds[0]}`)
          .send({
            title: "J-New",
          })
          .set("authorization", `Bearer ${u2Token}`);
      expect(resp.statusCode).toEqual(401);
    });
  
    test("not found on no such job", async function () {
      const resp = await request(app)
          .patch(`/jobs/0`)
          .send({
            handle: "new",
          })
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(400);
    });
  
    test("bad request on handle change attempt", async function () {
      const resp = await request(app)
          .patch(`/jobs/${testJobIds[0]}`)
          .send({
            handle: "new",
          })
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(400);
    });
  
    test("bad request with invalid data", async function () {
      const resp = await request(app)
          .patch(`/jobs/${testJobIds[0]}`)
          .send({
            salary: "not-a-number",
          })
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(400);
    });
  });
  
  /************************************** DELETE /jobs/:id */
  
  describe("DELETE /jobs/:id", function () {
    test("works for admin", async function () {
      const resp = await request(app)
          .delete(`/jobs/${testJobIds[0]}`)
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.body).toEqual({ deleted: testJobIds[0] });
    });
  
    test("unauth for others", async function () {
      const resp = await request(app)
          .delete(`/jobs/${testJobIds[0]}`)
          .set("authorization", `Bearer ${u2Token}`);
      expect(resp.statusCode).toEqual(401);
    });
  
    test("unauth for anon", async function () {
      const resp = await request(app)
          .delete(`/jobs/${testJobIds[0]}`);
      expect(resp.statusCode).toEqual(401);
    });
  
    test("not found for no such job", async function () {
      const resp = await request(app)
          .delete(`/jobs/0`)
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(404);
    });
  });
  

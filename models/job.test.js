"use strict";

const db = require("../db.js");
const app = require("../app");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */
describe("create", function () {
    const newJob = {
      title: "new",
      salary: 123456,
      equity: "0.5",
      id: expect.any(Number),
      company_handle: "c1",
    };
  
    test("works", async function () {
      let job = await Job.create(newJob);
      console.log("eresults -----------", job)
      expect(job).toEqual(newJob);
  
      const result = await db.query(
            `SELECT title, salary, equity, company_handle
             FROM jobs
             WHERE title = 'new'`);
      expect(result.rows).toEqual([
        {
            title: "new",
            salary: 123456,
            equity: "0.5",
            company_handle: "c1",
          },
      ]);
    });
  
    test("bad request with dupe", async function () {
      try {
        await Job.create(newJob);
        await Job.create(newJob);
        fail();
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
      }
    });
  });

/************************************** Filter / findAll() */
describe("filter / findAll", function () {
    test("works", async function () {
      let job = await Job.filter();
      expect(job).toEqual([{
        title: 'jobTitle1', 
        salary: 100000, 
        equity: '0.5', 
        company_handle: 'c2'},
        {
        title: 'jobTitle2', 
        salary: 200, 
        equity: '0.5', 
        company_handle: 'c3'},
        {
        title: 'jobTitle3', 
        salary: 50000, 
        equity: '0.5', 
        company_handle: 'c1'}]);
    });
    test("Filter title", async function () {
      let job = await Job.filter({title: "jobTitle1"});
      expect(job).toEqual([{
        title: 'jobTitle1', 
        salary: 100000, 
        equity: '0.5', 
        company_handle: 'c2'}]);
    });
    test("filter title and salary", async function () {
      let job = await Job.filter({title: "jobTitle", minSalary: 50000});
      expect(job).toEqual([{
        title: 'jobTitle1', 
        salary: 100000, 
        equity: '0.5', 
        company_handle: 'c2'},
        {
        title: 'jobTitle3', 
        salary: 50000, 
        equity: '0.5', 
        company_handle: 'c1'}
        ]);
    });
})
/************************************** get */

describe("get", function () {
    test("works", async function () {
     let job = await Job.get(testJobIds[0]);
      expect(job).toEqual({
        id: testJobIds[0],
        title: "jobTitle1",
        salary: 100000,
        equity: "0.5",
        company: {
          handle: "c2",
          name: "C2",
          description: "Desc2",
          numEmployees: 2,
          logoUrl: "http://c2.img",
        },
      });
    });
  
    test("not found if no such job", async function () {
      try {
        await Job.get(0);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
  });
  
  /************************************** update */
  
  describe("update", function () {
    let updateData = {
      title: "New",
      salary: 500,
      equity: "0.5",
    };
    // HERHEHRHERHEHREHHREHRHERHEHREH - not getting the hanld ewhich idk
    // if it is coming from the DB or not - 5/2
    test("works", async function () {
      let job = await Job.update(testJobIds[0], updateData);
      expect(job).toEqual({
        id: testJobIds[0],
        company_handle: "c2",
        ...updateData,
      });
    });
  
    test("not found if no such job", async function () {
      try {
        await Job.update(0, {
          title: "test",
        });
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
  
    test("bad request with no data", async function () {
      try {
        await Job.update(testJobIds[0], {});
        fail();
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
      }
    });
  });
  
  /************************************** remove */
  
  describe("remove", function () {
    test("works", async function () {
      await Job.remove(testJobIds[0]);
      const res = await db.query(
          "SELECT id FROM jobs WHERE id=$1", [testJobIds[0]]);
      expect(res.rows.length).toEqual(0);
    });
  
    test("not found if no such job", async function () {
      try {
        await Job.remove(0);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
  });
  

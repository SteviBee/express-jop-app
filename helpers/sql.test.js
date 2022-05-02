const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");
const request = require("supertest");

const app = require("../app");

// ************************** sqlForPartialUpdate
describe("testing sqlForPartialUpdate function", function () {
    test("gives keys OR Full answer", function () {
        const dataToUpdate = { firstName: 'updateThis', lastName: 'updateThisToo' }
        const jsToSql = { firstName: 'first_name', lastName: 'last_name', isAdmin: 'is_admin' }


        const ans =  sqlForPartialUpdate(dataToUpdate, jsToSql)
  
        expect(ans).toEqual({
              setCols: '"first_name"=$1, "last_name"=$2',
              values: [ 'updateThis', 'updateThisToo' ]
            })
    });

});


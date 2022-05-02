const { BadRequestError } = require("../expressError");


// Takes dataToUpdate and the SQL column name then returns SQL cols and values to go in SQL SET call 
//  
// Input dataToUpdate, jsToSql: { firstName: 'UPDATED2!!', lastName: 'LNUpdated!!' }, { firstName: 'first_name', lastName: 'last_name', isAdmin: 'is_admin' }
// Output data: {
//   setCols: '"first_name"=$1, "last_name"=$2',
//   values: [ 'UPDATED2!!', 'LNUpdated!!' ]
// }
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");
 
  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };

const jwt = require("jsonwebtoken");
const { sqlForPartialUpdate } = require("./sql");
const { SECRET_KEY } = require("../config");


describe("sqlForPartialUpdate", function () {
    test("gets valid data and returns correct format", function () {
    
    // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']

    const data = {firstName: 'Aliya', age: 32};
    const jsToSql = {
        firstName: "first_name",
      };
    const resp = sqlForPartialUpdate(data,jsToSql);
    expect(resp).toEqual({"setCols": "\"first_name\"=$1, \"age\"=$2", "values": ["Aliya", 32]});

    });
    
  });
  
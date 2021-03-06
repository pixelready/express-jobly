"use strict";

const db = require( "../db.js" );
const { BadRequestError, NotFoundError } = require( "../expressError" );
const { Job } = require( "./job.js" );
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll } = require( "./_testCommon" );

beforeAll( commonBeforeAll );
beforeEach( commonBeforeEach );
afterEach( commonAfterEach );
afterAll( commonAfterAll );

/************************************** create */
// POST: Create a new job successfully

// POST: Fail to create a job w/ bad data

// POST: Unauth if anon

// POST: Unauth if non-admin

/** Create a job(from data), update db, return new job data.
   *
   *  Data should be {id, title, salary, equity, companyHandle}
   *
   *  Returns {id, title, salary, equity, companyHandle}
   */
describe( "create", function() {
  const newJob = {
    title: "CEO",
    salary: 10000000,
    equity: 0.02,
    companyHandle: "c1"
  };

  test( "works", async function() {
    let job = await Job.create( newJob );
    let {title, salary, equity, companyHandle} = newJob;
    expect( job )
      .toEqual( {title, salary, equity: String(equity), companyHandle} );

    const result = await db.query( `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title='CEO'` );
    expect( result.rows )
      .toEqual( [ {
        title: "CEO",
        salary: 10000000,
        equity: "0.02",
        company_handle: "c1"
      } ] );
  } );

} );

/************************************** findAll */

describe( "findAll", function() {
  test( "works: no filter", async function() {
    let jobs = await Job.findAll( );
    console.log("JOB 1 ID: ", job1Id);
    expect( jobs )
      .toEqual( [ {
        id: job1Id,
        title: "job1",
        salary: 100000,
        equity: "1.0",
        companyHandle: "c1"
      },
      { id: job2Id,
        title: "job2",
        salary: 90000,
        equity: "0.2",
        companyHandle: "c1"
      },
      { id: job3Id,
        title: "job3",
        salary: 65000,
        equity: "0.0015",
        companyHandle: "c2"
      } 
      ] );
  } );

//   test( "works: with name filter", async function() {
//     let companies = await Company.findAll( {
//       name: "1"
//     } );
//     expect( companies )
//       .toEqual( [ {
//         handle: "c1",
//         name: "C1",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img"
//       } ] );
//   } );
//   test( "works: with minEmployees filter", async function() {
//     let companies = await Company.findAll( {
//       minEmployees: 3
//     } );
//     expect( companies )
//       .toEqual( [ {
//         handle: "c3",
//         name: "C3",
//         description: "Desc3",
//         numEmployees: 3,
//         logoUrl: "http://c3.img"
//       } ] );
//   } );
//   test( "works: with maxEmployees filter", async function() {
//     let companies = await Company.findAll( {
//       maxEmployees: 1
//     } );
//     expect( companies )
//       .toEqual( [ {
//         handle: "c1",
//         name: "C1",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img"
//       } ] );
//   } );
//   test( "works: with numEmployees range filter", async function() {
//     let companies = await Company.findAll( {
//       minEmployees: 2,
//       maxEmployees: 3
//     }, {} );
//     expect( companies )
//       .toEqual( [ {
//         handle: "c2",
//         name: "C2",
//         description: "Desc2",
//         numEmployees: 2,
//         logoUrl: "http://c2.img"
//       }, {
//         handle: "c3",
//         name: "C3",
//         description: "Desc3",
//         numEmployees: 3,
//         logoUrl: "http://c3.img"
//       } ] );
//   } );
//   test( "no match filter combination returns 0", async function() {
//     let companies = await Company.findAll( {
//       name: "C1",
//       minEmployees: 3
//     });
//     expect( companies.length )
//       .toEqual( 0 );
//   } );
//   test( "throws error: min > max", async function() {
//     try {
//       let companies = await Company.findAll( {
//         minEmployees: 3,
//         maxEmployees: 1
//       });
//       fail();
//     } catch ( err ) {
//       expect( err instanceof BadRequestError )
//         .toBeTruthy();
//     }
//   } );
} );

/************************************** get */

describe( "get", function() {
  test( "works", async function() {
    let job = await Job.get( job1Id );
    expect( job )
      .toEqual( {
        title: "job1",
        salary: 100000,
        equity: 1.0,
        companyHandle: "c1"
      } );
  } );

  test( "not found if no such job", async function() {
    try {
      await Job.get( "nope" );
      fail();
    } catch ( err ) {
      expect( err instanceof NotFoundError )
        .toBeTruthy();
    }
  } );
} );

/************************************** update */

describe( "update", function() {
  const updateData = {
    title: "job1",
    salary: 200000,
    equity: 1.0,
    companyHandle: "c1"
  };

  test( "works", async function() {
    let job = await Job.update( job1Id, updateData );
    expect( job )
      .toEqual( {
        id: job1Id,
        ...updateData
      } );

    const result = await db.query( `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = ${job1Id}` );
    expect( result.rows )
      .toEqual( [ {
        id: job1Id,
        title: "job1",
        salary: 200000,
        equity: 1.0,
        company_handle: "c1"
      } ] );
  } );

  test( "works: null fields", async function() {
    const updateDataSetNulls = {
        title: "job1",
        salary: null,
        equity: null,
        companyHandle: "c1"
    };

    let job = await Job.update( job1Id, updateDataSetNulls );
    expect( job )
      .toEqual( {
        id: job1Id,
        ...updateDataSetNulls
      } );

    const result = await db.query( `SELECT id, title, salary, equity, company_handle
            FROM jobs
            WHERE id = ${job1Id}` );
    expect( result.rows )
      .toEqual( [ {
        id: job1Id,
        title: "job1",
        salary: null,
        equity: null,
        company_handle: "c1"
    } ] );
  } );

  test( "not found if no such job", async function() {
    try {
      await Job.update( "nope", updateData );
      fail();
    } catch ( err ) {
      expect( err instanceof NotFoundError )
        .toBeTruthy();
    }
  } );

  test( "bad request with no data", async function() {
    try {
      await Job.update( job1Id, {} );
      fail();
    } catch ( err ) {
      expect( err instanceof BadRequestError )
        .toBeTruthy();
    }
  } );
} );

// /************************************** remove */

describe( "remove", function() {
  test( "works", async function() {
    await Job.remove( job1Id );
    const res = await db.query( `SELECT id FROM jobs WHERE id=${job1Id}` );
    expect( res.rows.length )
      .toEqual( 0 );
  } );

  test( "not found if no such job", async function() {
    try {
      await Job.remove( "nope" );
      fail();
    } catch ( err ) {
      expect( err instanceof NotFoundError )
        .toBeTruthy();
    }
  } );
} );




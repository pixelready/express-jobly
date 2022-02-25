"use strict";

const db = require( "../db.js" );
const { BadRequestError, NotFoundError } = require( "../expressError" );
const Job = require( "./job.js" );
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll } = require( "./_testCommon" );

beforeAll( commonBeforeAll );
beforeEach( commonBeforeEach );
afterEach( commonAfterEach );
afterAll( commonAfterAll );

// GET: Get all jobs - no auth

// GET: Get a job by ID - no auth

// PATCH: Update a job successfully

// PATCH: Fail on bad data (admin)

// PATCH: Fail on not found (admin)

// PATCH: Fail on changing company handle (admin)

// PATCH: Unauth if anon

// PATCH: Unauth if non-admin

// DELETE: Remove a job successfully

// DELETE: Fail on not found (admin)

// DELETE: Unauth if anon

// DELETE: Unauth if non-admin

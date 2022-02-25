"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");

class Job {
  /** Create a job(from data), update db, return new job data.
   *
   *  Data should be {id, title, salary, equity, companyHandle}
   *
   *  Returns {id, title, salary, equity, companyHandle}
   */
  static async create({ id, title, salary, equity, companyHandle }) {
    const duplicateCheck = await db.query(
      `SELECT id
           FROM jobs
           WHERE id = $1`,
      [id]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate job: ${id}`);

    const result = await db.query(
      `
                    INSERT INTO jobs(
                        title,
                        salary,
                        equity,
                        companyHandle
                    )
                    VALUES ($1, $2, $3, $4)
                    RETURNING title, salary, equity, companyHandle`,
      [title, salary, equity, companyHandle]
    );
    const job = result.rows[0];
    return job;
  }



}

module.exports = {Job};
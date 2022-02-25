"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

class Job {
  /** Create a job(from data), update db, return new job data.
   *
   *  Data should be {id, title, salary, equity, companyHandle}
   *
   *  Returns {id, title, salary, equity, companyHandle}
   */
  static async create({title, salary, equity, companyHandle }) {
    console.log("INSIDE CREATE:");
    // const duplicateCheck = await db.query(
    //   `SELECT id
    //        FROM jobs
    //        WHERE id = $1`,
    //   [id]
    // );

    // if (duplicateCheck.rows[0])
    //   throw new BadRequestError(`Duplicate job: ${id}`);

    const result = await db.query(
      `
                    INSERT INTO jobs(
                        title,
                        salary,
                        equity,
                        company_handle
                    )
                    VALUES ($1, $2, $3, $4)
                    RETURNING title, salary, equity, company_handle AS "companyHandle"`,
      [title, salary, equity, companyHandle]
    );
    const job = result.rows[0];
    return job;
  }

  /** Given a job ID, return data about company.
   *
   * Returns { id, title, salary, equity, companyHandle }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get( id ) {
    const jobRes = await db.query( `SELECT id,
                
           FROM jobs
           WHERE id = $1`, [ id ] );

    const job = jobRes.rows[ 0 ];

    if ( !job )
      throw new NotFoundError( `No job: ${id}` );

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: { title, salary, equity, companyHandle }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   */

  static async update( id, data ) {
    const { setCols, values } = sqlForPartialUpdate( data, {
      companyHandle: "company_handle"
    } );
    const jobIdVarIdx = "$" + (
      values.length + 1 );

    const querySql = `
      UPDATE jobs
      SET ${setCols}
        WHERE id = ${jobIdVarIdx}
        RETURNING id, title, salary, equity, company_handle AS "companyHandle"`;
    const result = await db.query( querySql, [
      ...values,
      id
    ] );
    const job = result.rows[ 0 ];

    if ( !job )
      throw new NotFoundError( `No job: ${id}` );

    return job;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove( id ) {
    const result = await db.query( `DELETE
           FROM job
           WHERE id = $1
           RETURNING id`, [ id ] );

    const job = result.rows[ 0 ];

    if ( !job )
      throw new NotFoundError( `No job: ${id}` );
  }
}

module.exports = {Job};
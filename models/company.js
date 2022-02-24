"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForFilter } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
      `SELECT handle
           FROM companies
           WHERE handle = $1`,
      [handle]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
      `INSERT INTO companies(
          handle,
          name,
          description,
          num_employees,
          logo_url)
           VALUES
             ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
      [handle, name, description, numEmployees, logoUrl]
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies. Optionally pass filters: {name, minEmployees, maxEmployees}
   * @param {object} filters
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * for all matched companies
   * */

  // TODO: check which params are passed, then build conditionals for WHERE
  // TODO: see if we can re-use sqlPartialUpdate for formatting
  // TODO: join where clause and pass
  // TODO: WHERE name ILIKE $1 AND num_employees > $2 AND num_employees < $3

  static async findAll(filters) {
    if (
      filters.minEmployees &&
      filters.maxEmployees &&
      filters.minEmployees > filters.maxEmployees
    ) {
      throw new BadRequestError();
    }
    let whereClause = "";
    let params = [];
    const {name , minEmployees, maxEmployees} = filters;
    if (Object.keys(filters).length !== 0) {

      const { placeHolders, values } = sqlForFilter(filters);
      const whereClauseBuilder = [];
      console.log("NAME FILTER", placeHolders);
      if (name) {
        let nameIndex = values.indexOf(name);
        console.log("IF NAME FILTER", placeHolders);
        whereClauseBuilder.push(`name ILIKE ${placeHolders}`);
        values[nameIndex] = `%${
          values[nameIndex]
        }%`;
      }
      if (minEmployees) {
        whereClauseBuilder.push(`num_employees > ${placeHolders["minEmployees"]}`);
      }
      if (maxEmployees) {
        whereClauseBuilder.push(`num_employees < ${placeHolders["maxEmployees"]}`);
      }

      whereClause = "WHERE ";

      whereClause += whereClauseBuilder.join(" AND ") || whereClauseBuilder[0];
      params = [...values] || [];
      console.log("VALUES: ", values);
      

    }

    console.log("WHERECLAUSE: ", whereClause);
    console.log("PARAMS: ", params);

    const companiesRes = await db.query(
      `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
           FROM companies
           ORDER BY name
           ${whereClause}`,
          params
    );
    return companiesRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
      `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
      [handle]
    );

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      numEmployees: "num_employees",
      logoUrl: "logo_url",
    });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `
      UPDATE companies
      SET ${setCols}
        WHERE handle = ${handleVarIdx}
        RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
      `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
      [handle]
    );

    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}

module.exports = Company;

"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
    /** Create a job (from data), update db, return new job data.
     *
     * data should be { title, salary, equity, company_handle, REF companies }
     *
     * Returns { title, salary, equity, company_handle}
     *
     * Throws BadRequestError if job already in database.
     * */
  
    static async create({ title, salary, equity, company_handle}) {
      const duplicateCheck = await db.query(
            `SELECT title
             FROM jobs
             WHERE title = $1`,
          [title]);
  
      if (duplicateCheck.rows[0])
        throw new BadRequestError(`Duplicate job: ${title}`);
  
      const result = await db.query(
            `INSERT INTO jobs
             (title, salary, equity, company_handle)
             VALUES ($1, $2, $3, $4)
             RETURNING title, salary, equity, company_handle, id`,
          [
            title, 
            salary, 
            equity, 
            company_handle, 
            ]
      );
      const company = result.rows[0];
  
      return company;
    }
   
  /** Find all jobs (optional filter on searchFilters).
   *
   * searchFilters (all optional):
   * - minSalary
   * - hasEquity (true returns only jobs with equity > 0, other values ignored)
   * - title (will find case-insensitive, partial matches)
   *
   * Returns [{ id, title, salary, equity, companyHandle, companyName }, ...]
   * */
  
    static async filter(queries = {}) {
  
      const { title, minSalary, hasEquity } = queries;
  
      let buildingQuery = `SELECT title,
                    salary,
                    equity,
                    company_handle                   
             FROM jobs`;
      let filterSQL = [];
      let valArray = [];
      // For each search term, add the value to valArray and then push the corrisponding
      // SQL onto the buildingQuery. At the end pass everything to one final query.
      if (title !== undefined) {
        valArray.push(`%${title}%`);
        filterSQL.push(`title ILIKE $${valArray.length}`);
      }
      
      if (minSalary !== undefined) {
        valArray.push(minSalary);
        filterSQL.push(`salary >= $${valArray.length}`);
      }
      
      if (hasEquity) {
        // valArray.push(hasEquity);
        filterSQL.push(`equity > 0`);
      }
    //   } else if (!hasEquity || (hasEquity = undefined)) { 
    //     filterSQL.push(`equity > 0`);
    //   }
      
      // Add filterSQL and order by to final query
      if (filterSQL.length > 0) {
        buildingQuery += " WHERE " + filterSQL.join(" AND ");
      }
      buildingQuery += " ORDER BY title";
  
      
      // Call final query and return results 
      const jobRes = await db.query(buildingQuery, valArray)
  
      return jobRes.rows;
    }
    
    /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, companyHandle, company }
   *   where company is { handle, name, description, numEmployees, logoUrl }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
          `SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           WHERE id = $1`, [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    const companiesRes = await db.query(
          `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`, [job.companyHandle]);

    delete job.companyHandle;
    job.company = companiesRes.rows[0];

    return job;
  }
  
     /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include: { title, salary, equity }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   */
  
    static async update(id, data) {
      const { setCols, values } = sqlForPartialUpdate(
          data,
          {});
      const idVarIdx = "$" + (values.length + 1);
  
      const querySql = `UPDATE jobs 
                        SET ${setCols} 
                        WHERE id = ${idVarIdx} 
                        RETURNING id, 
                                  title, 
                                  salary, 
                                  equity, 
                                  company_handle`;
      const result = await db.query(querySql, [...values, id]);
      const job = result.rows[0];
  
      if (!job) throw new NotFoundError(`No job: ${id}`);
  
      return job;
    }
  
    /** Delete given company from database; returns undefined.
     *
     * Throws NotFoundError if company not found.
     **/
  
    static async remove(id) {
      const result = await db.query(
            `DELETE
             FROM jobs
             WHERE id = $1
             RETURNING id`,
          [id]);
      const job = result.rows[0];
  
      if (!job) throw new NotFoundError(`No job: ${id}`);
    }
  }
  
  
  module.exports = Job;
  
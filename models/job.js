const db = require('../db');
const {
  sqlForPartialUpdate,
  classPartialUpdate
} = require('../helpers/partialUpdate');

class Job /* extends Model */ {
  constructor({ id, title, salary, equity, company_handle, date_posted }) {
    this.id = id;
    this.title = title;
    this.salary = salary;
    this.equity = equity;
    this.company_handle = company_handle;
    this.date_posted = date_posted;
  }

  // make setter/getter that makes it so you can't change primary key

  set id(val) {
    if (this._id) {
      throw new Error(`Can't change job id!`);
    }
    this._id = val;
  }

  get id() {
    return this._id;
  }

  //Get a filtered list of jobs and return array of instances
  static async getFilteredJobs({ search, min_salary, min_equity }) {
    //If search is undefined then search will be %%
    let result = await db.query(
      `
    SELECT id, title, salary, equity, company_handle, date_posted
    FROM jobs 
    WHERE (title ILIKE $1 or company_handle ILIKE $1) 
    and salary >= $2 and equity >= $3`,
      [
        `%${search === undefined ? '' : search}%`,
        min_salary === undefined ? 0 : min_salary,
        min_equity === undefined ? 0 : min_equity
      ]
    );

    return result.rows.map(job => new Job(job));
  }

  //Create a new job and return an instance
  static async createJob({ title, salary, equity, company_handle }) {
    let result = await db.query(
      `
    INSERT INTO jobs (title, salary, equity, company_handle)
    VALUES ($1,$2,$3,$4)
    RETURNING id, title, salary, equity, company_handle, date_posted`,
      [title, salary, equity, company_handle]
    );

    if (result.rows.length === 0) {
      throw new Error('Cannot create job');
    }

    return new Job(result.rows[0]);
  }

  //Get job and return an instance
  static async getJob(id) {
    let result = await db.query(
      `
    SELECT id, title, salary, equity, company_handle, date_posted
    FROM jobs 
    WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      const err = new Error('Cannot find job by that id');
      err.status = 400;
      throw err;
    }

    return new Job(result.rows[0]);
  }

  updateFromValues(vals) {
    classPartialUpdate(this, vals);
  }

  //Update a job instance
  async save() {
    const { query, values } = sqlForPartialUpdate(
      'jobs',
      {
        title: this.title,
        salary: this.salary,
        equity: this.equity,
        company_handle: this.company_handle
      },
      'id',
      this.id
    );
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      const err = new Error('Cannot find job to update');
      err.status = 400;
      throw err;
    }
  }

  //Delete job and return a message
  async deleteJob() {
    const result = await db.query(
      `
    DELETE FROM jobs 
    WHERE id=$1
    RETURNING id`,
      [this.id]
    );
    if (result.rows.length === 0) {
      throw new Error('Could not delete job');
    }
    return 'Job Deleted';
  }
}

module.exports = Job;

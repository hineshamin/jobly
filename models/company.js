const db = require('../db');
const {
  sqlForPartialUpdate,
  classPartialUpdate
} = require('../helpers/partialUpdate');

class Company {
  constructor({ handle, name, num_employees, description, logo_url }) {
    this.handle = handle;
    this.name = name;
    this.num_employees = num_employees;
    this.description = description;
    this.logo_url = logo_url;
  }

  // make setter/getter that makes it so you can't change primary key

  set handle(str) {
    if (this._handle) {
      throw new Error(`Can't change company handle!`);
    }
    this._handle = str;
  }

  get handle() {
    return this._handle;
  }

  //Get a filtered list of companies and return array of instances
  static async getFilteredCompanies({ search, min, max }) {
    if (+min > +max) {
      const error = new Error('Min cannot be greater than max');
      error.status = 400;
      throw error;
    }

    //If search is undefined then search will be %%
    let result = await db.query(
      `
    SELECT handle, name, num_employees, description, logo_url
    FROM companies 
    WHERE (name ILIKE $1 or handle ILIKE $1) 
    and num_employees > $2 and num_employees < $3`,
      [
        `%${search === undefined ? '' : search}%`,
        min === undefined ? 0 : min,
        max === undefined ? 2147483646 : max
      ]
    );

    return result.rows.map(company => new Company(company));
  }

  //Create a new company and return an instance
  static async createCompany({
    handle,
    name,
    num_employees,
    description,
    logo_url
  }) {
    let result = await db.query(
      `
    INSERT INTO companies (handle, name, num_employees, description, logo_url)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING handle, name, num_employees, description, logo_url`,
      [handle, name, num_employees, description, logo_url]
    );

    if (result.rows.length === 0) {
      throw new Error('Cannot create company');
    }

    return new Company(result.rows[0]);
  }

  //Get company and return an instance
  static async getCompany(handle) {
    let result = await db.query(
      `
    SELECT handle, name, num_employees, description, logo_url
    FROM companies 
    WHERE handle = $1`,
      [handle]
    );

    if (result.rows.length === 0) {
      const err = new Error('Cannot find company by that handle');
      err.status = 400;
      throw err;
    }

    return new Company(result.rows[0]);
  }

  //Update the company instance attributes
  updateFromValues(vals) {
    classPartialUpdate(this, vals);
  }

  //Update a company instance
  async save() {
    const { query, values } = sqlForPartialUpdate(
      'companies',
      {
        name: this.name,
        num_employees: this.num_employees,
        description: this.description,
        logo_url: this.logo_url
      },
      'handle',
      this.handle
    );

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      const err = new Error('Cannot find company to update');
      err.status = 400;
      throw err;
    }
  }

  //Delete company and return a message
  async deleteCompany() {
    const result = await db.query(
      `
    DELETE FROM companies 
    WHERE handle=$1
    RETURNING handle`,
      [this.handle]
    );
    if (result.rows.length === 0) {
      throw new Error('Could not delete company');
    }
    return 'Company Deleted';
  }
}

module.exports = Company;

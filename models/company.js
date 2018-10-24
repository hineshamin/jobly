const db = require('../db');

class Company {
  constructor({ handle, name, num_employees, description, logo_url }) {
    this.handle = handle;
    this.name = name;
    this.num_employees = num_employees;
    this.description = description;
    this.logo_url = logo_url;
  }

  //Get a filtered list of companies and return array of instances
  static async getFilteredCompanies({ search, min, max }) {
    if (+min > +max) {
      const error = new Error('Min cannot be greater than max');
      error.status = 400;
      throw error;
    }
    let result = await db.query(
      `
    SELECT handle,name,num_employees,description,logo_url
    FROM companies 
    WHERE (name ILIKE $1 or handle ILIKE $1) 
    and num_employees > $2 and num_employees < $3`,
      [`%${search || ''}%`, min || 0, max || 2147483646]
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
    INSERT INTO companies (handle,name,num_employees,description,logo_url)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING handle,name,num_employees,description,logo_url`,
      [handle, name, num_employees, description, logo_url]
    );
    return new Company(result.rows[0]);
  }

  //Get company and return an instance
  static async getCompany(handle) {
    let result = await db.query(
      `
    SELECT handle,name,num_employees,description,logo_url
    FROM companies 
    WHERE handle = $1`,
      [handle]
    );
    return new Company(result.rows[0]);
  }
}

module.exports = Company;

const db = require('../db');

class Company {
  constructor({ handle, name, num_employees, description, logo_url }) {
    this.handle = handle;
    this.name = name;
    this.num_employees = num_employees;
    this.description = description;
    this.logo_url = logo_url;
  }
  static async getFilteredCompanies({ search, min, max }) {
    if (min > max) {
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
}

module.exports = Company;

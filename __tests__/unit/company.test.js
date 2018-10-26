process.env.NODE_ENV = 'test';
const Company = require('../../models/company');
const db = require('../../db');

let company1;
let company2;
//Insert 2 companies before each test
beforeEach(async function () {
  await db.query(`
  CREATE TABLE companies
  (
    handle text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    num_employees int,
    description text,
    logo_url text
  )
  `)
  let result1 = await db.query(`
  INSERT INTO companies (handle,name,num_employees,description,logo_url)
  VALUES ('AAPL','apple',123000,'Maker of hipster computers','http://www.apllogo.com')
  RETURNING handle,name,num_employees,description,logo_url
  `);
  let result2 = await db.query(`
  INSERT INTO companies (handle,name,num_employees,description,logo_url)
  VALUES ('GOOG','google',70000,'Search engine giant','http://www.google.com')
  RETURNING handle,name,num_employees,description,logo_url
  `);
  company1 = result1.rows[0];
  company2 = result2.rows[0];
});

//Test get filtered companies
describe('getFilteredCompanies()', () => {
  it('should correctly return a filtered list of companies', async function () {
    const companies = await Company.getFilteredCompanies({});
    expect(companies.length).toEqual(2);
    expect(companies[0]).toHaveProperty('handle', company1.handle);
    expect(companies[1]).toHaveProperty('logo_url', company2.logo_url);
    const filteredCompaniesMin = await Company.getFilteredCompanies({
      min: 71000
    });
    expect(filteredCompaniesMin.length).toEqual(1);
    const filteredCompaniesMax = await Company.getFilteredCompanies({
      max: 120000
    });
    expect(filteredCompaniesMax.length).toEqual(1);
    const filteredCompaniesSearch = await Company.getFilteredCompanies({
      search: 'ogl'
    });
    expect(filteredCompaniesSearch.length).toEqual(1);

    try {
      const filtered400 = await Company.getFilteredCompanies({
        min: 100,
        max: 0
      });
    } catch (e) {
      expect(e.message).toMatch('Min cannot be greater than max');
    }
  });
});

//Test creating company
describe('createCompany()', () => {
  it('should correctly add a company', async function () {
    const newCompany = await Company.createCompany({
      handle: 'NFLX',
      name: 'Netflix',
      num_employees: 5000,
      description: 'American media services provider',
      logo_url: 'http://netflix.com'
    });
    expect(newCompany.handle).toEqual('NFLX');
    const companies = await Company.getFilteredCompanies({});
    expect(companies.length).toEqual(3);
  });
});

//Test get one company
describe('getCompany()', () => {
  it('should correctly return a company by handle', async function () {
    const company = await Company.getCompany(company1.handle);
    expect(company.handle).toEqual(company1.handle);
    expect(company.num_employees).toEqual(company1.num_employees);

    //get a company that doesn't exist and check failure
    try {
      await Company.getCompany('nocompany');
    } catch (e) {
      expect(e.message).toMatch('Cannot find company by that handle');
    }
  });
});

//Update a company test
describe('updateCompany()', () => {
  it('should correctly update a company', async function () {
    let company = await Company.getCompany(company1.handle);
    company.name = 'APPLEDRINK';

    await company.save();
    company = await Company.getCompany(company1.handle);
    expect(company.name).toEqual('APPLEDRINK');

    const companies = await Company.getFilteredCompanies({});
    expect(companies.length).toEqual(2);

    expect(() => {
      company.handle = 'THISSHOULDFAIL';
    }).toThrowError(`Can't change company handle!`);
  });
});

//Delete a company test
describe('deleteCompany()', () => {
  it('should correctly delete a company', async function () {
    const companyToBeDeleted = await Company.getCompany(company1.handle);
    const message = await companyToBeDeleted.deleteCompany();
    expect(message).toBe('Company Deleted');
  });
});

//Delete companies after each tets
afterEach(async function () {
  await db.query(`DROP TABLE companies`);
});

//Close db connection
afterAll(async function () {
  await db.end();
});

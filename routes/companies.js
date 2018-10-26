const express = require('express');
const router = new express.Router();
const Company = require('../models/company');
const Job = require('../models/job');
const { classPartialUpdate } = require('../helpers/partialUpdate');
const validateInput = require('../middleware/validation');
const newCompanySchema = require('../schema/newCompany.json');
const updateCompanySchema = require('../schema/updateCompany.json');
const { ensureLoggedIn, ensureCorrectUser, ensureAdminUser } = require('../middleware/auth');

//Get a filtered list of companies
router.get('/', ensureLoggedIn, async function (req, res, next) {
  try {
    const companiesResults = await Company.getFilteredCompanies(req.query);
    const companies = companiesResults.map(company => ({
      name: company.name,
      handle: company.handle
    }));
    return res.json({ companies });
  } catch (error) {
    return next(error);
  }
});

//Create a new company
router.post('/', ensureAdminUser, validateInput(newCompanySchema), async function (
  req,
  res,
  next
) {
  try {
    const company = await Company.createCompany(req.body);
    return res.json({ company });
  } catch (error) {
    return next(error);
  }
});

//Get a company by handle
router.get('/:handle', ensureLoggedIn, async function (req, res, next) {
  try {
    const company = await Company.getCompany(req.params.handle);
    const jobs = await Job.getFilteredJobs({ search: company.handle });
    company.jobs = jobs;
    return res.json({ company });
  } catch (error) {
    return next(error);
  }
});

//Update a company
router.patch('/:handle', ensureAdminUser, validateInput(updateCompanySchema), async function (
  req,
  res,
  next
) {
  try {
    const company = await Company.getCompany(req.params.handle);
    company.updateFromValues(req.body);
    company.save();
    return res.json({ company });
  } catch (error) {
    return next(error);
  }
});

//Delete a company
router.delete('/:handle', ensureAdminUser, async function (req, res, next) {
  try {
    const companyToDelete = await Company.getCompany(req.params.handle);
    const message = await companyToDelete.deleteCompany();
    return res.json({ message });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

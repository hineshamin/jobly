const express = require('express');
const router = new express.Router();
const Job = require('../models/job');
const { classPartialUpdate } = require('../helpers/partialUpdate');
const validateInput = require('../middleware/validation');

//Get a filtered list of jobs
router.get('/', async function (req, res, next) {
  try {
    const jobsResults = await Job.getFilteredJobs(req.query);
    const jobs = jobsResults.map(job => ({
      title: job.title,
      company_handle: job.company_handle
    }));
    return res.json({ jobs });
  } catch (error) {
    return next(error);
  }
});

//Create a new job
router.post('/', async function (
  req,
  res,
  next
) {
  try {
    const job = await Job.createJob(req.body);
    return res.json({ job });
  } catch (error) {
    return next(error);
  }
});

// //Get a job by handle
// router.get('/:handle', async function (req, res, next) {
//   try {
//     const job = await Company.getCompany(req.params.handle);
//     return res.json({ job });
//   } catch (error) {
//     return next(error);
//   }
// });

// //Update a job
// router.patch('/:handle', validateInput(updateCompanySchema), async function (
//   req,
//   res,
//   next
// ) {
//   try {
//     const companyToUpdate = await Company.getCompany(req.params.handle);
//     classPartialUpdate(companyToUpdate, req.body);
//     const updatedCompany = await companyToUpdate.updateCompany();
//     return res.json({ job: updatedCompany });
//   } catch (error) {
//     return next(error);
//   }
// });

// //Delete a job
// router.delete('/:handle', async function (req, res, next) {
//   try {
//     const companyToDelete = await Company.getCompany(req.params.handle);
//     const message = await companyToDelete.deleteCompany();
//     return res.json({ message });
//   } catch (error) {
//     return next(error);
//   }
// });

module.exports = router;

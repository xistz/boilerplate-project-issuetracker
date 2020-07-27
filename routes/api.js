/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

const client = (async () => {
  try {
    return await MongoClient.connect(CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error(error);
  }
})();

module.exports = function (app) {
  app
    .route('/api/issues/:project')

    .get(async (req, res) => {
      const { project } = req.params;

      const db = (await client).db('issuetracker');

      const issues = await db
        .collection('issues')
        .find({ project: project })
        .toArray();

      res.json(issues);
    })

    .post(async (req, res) => {
      const { project } = req.params;
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      } = req.body;

      const valid = issue_title && issue_text && created_by;

      if (!valid) {
        res.status(400).json({ error: 'missing inputs' });
        return;
      }

      const db = (await client).db('issuetracker');

      const { insertedId } = await db.collection('issues').insertOne({
        project,
        issue_title,
        issue_text,
        created_by,
        ...(assigned_to ? { assigned_to } : { assigned_to: '' }),
        ...(status_text ? { status_text } : { status_text: '' }),
        open: true,
        created_on: new Date().toISOString(),
        updated_on: new Date().toISOString(),
      });
      const issue = await db.collection('issues').findOne({ _id: insertedId });

      res.status(201).json(issue);
    })

    .put(function (req, res) {
      const { project } = req.params;
    })

    .delete(function (req, res) {
      const { project } = req.params;
    });
};

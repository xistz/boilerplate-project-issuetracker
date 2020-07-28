/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

const expect = require('chai').expect;
const { MongoClient, ObjectId } = require('mongodb');

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

      const {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open,
        created_on,
        updated_on,
      } = req.query;

      const db = (await client).db('issuetracker');

      const issues = await db
        .collection('issues')
        .find({
          project,
          ...(_id && { _id: ObjectId(_id) }),
          ...(issue_title && { issue_title }),
          ...(issue_text && { issue_text }),
          ...(created_by && { created_by }),
          ...(assigned_to && { assigned_to }),
          ...(status_text && { status_text }),
          ...(open !== undefined && { open }),
          ...(created_on && { created_on }),
          ...(updated_on && { updated_on }),
        })
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

    .put(async (req, res) => {
      const { project } = req.params;
      const {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open,
      } = req.body;

      const valid =
        _id &&
        (issue_title ||
          issue_text ||
          created_by ||
          assigned_to ||
          status_text ||
          open !== undefined);

      if (!valid) {
        res.status(400).json({ error: 'no field to update' });
        return;
      }

      const db = (await client).db('issuetracker');

      const { value: issue } = await db.collection('issues').findOneAndUpdate(
        { _id: ObjectId(_id), project },
        {
          $set: {
            ...(issue_title && { issue_title }),
            ...(issue_text && { issue_text }),
            ...(created_by && { created_by }),
            ...(assigned_to && { assigned_to }),
            ...(status_text && { status_text }),
            ...(open !== undefined && { open }),
            updated_on: new Date().toISOString(),
          },
        },
        { returnOriginal: false }
      );

      res.json(issue);
    })

    .delete(async (req, res) => {
      const { project } = req.params;
      const { _id } = req.body;

      if (!_id) {
        res.status(400).json({ error: 'missing _id' });
        return;
      }

      const db = (await client).db('issuetracker');
      await db.collection('issues').deleteOne({ _id: ObjectId(_id) });

      res.status(204).end();
    });
};

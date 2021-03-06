/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  suite('POST /api/issues/{project} => object with issue data', function () {
    test('Every field filled in', function (done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA',
        })
        .end(function (err, res) {
          assert.equal(res.status, 201);
          assert.equal(res.type, 'application/json');
          assert.isDefined(res.body._id);
          assert.equal(res.body.issue_title, 'Title');
          assert.equal(res.body.issue_text, 'text');
          assert.equal(
            res.body.created_by,
            'Functional Test - Every field filled in'
          );
          assert.equal(res.body.assigned_to, 'Chai and Mocha');
          assert.equal(res.body.status_text, 'In QA');
          assert.isTrue(res.body.open);
          assert.isDefined(res.body.created_on);
          assert.isDefined(res.body.updated_on);

          done();
        });
    });

    test('Required fields filled in', function (done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Required fields filled in',
        })
        .end(function (err, res) {
          assert.equal(res.status, 201);
          assert.equal(res.type, 'application/json');
          assert.isDefined(res.body._id);
          assert.equal(res.body.issue_title, 'Title');
          assert.equal(res.body.issue_text, 'text');
          assert.equal(
            res.body.created_by,
            'Functional Test - Required fields filled in'
          );
          assert.equal(res.body.assigned_to, '');
          assert.equal(res.body.status_text, '');
          assert.isTrue(res.body.open);
          assert.isDefined(res.body.created_on);
          assert.isDefined(res.body.updated_on);

          done();
        });
    });

    test('Missing required fields', function (done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
        })
        .end(function (err, res) {
          assert.equal(res.status, 400);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.error, 'missing inputs');

          done();
        });
    });
  });

  suite('PUT /api/issues/{project} => text', function () {
    test('No body', function (done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - No body',
        })
        .end(function (err, res) {
          const { _id } = res.body;

          chai
            .request(server)
            .put('/api/issues/test')
            .send({
              _id,
            })
            .end(function (err, res) {
              assert.equal(res.status, 400);
              assert.equal(res.type, 'application/json');
              assert.equal(res.body.error, 'no field to update');

              done();
            });
        });
    });

    test('One field to update', function (done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - One field to update',
        })
        .end(function (err, res) {
          const { _id } = res.body;

          chai
            .request(server)
            .put('/api/issues/test')
            .send({
              _id,
              open: false,
            })
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.type, 'application/json');
              assert.equal(res.body._id, _id);
              assert.equal(res.body.issue_title, 'Title');
              assert.equal(res.body.issue_text, 'text');
              assert.equal(
                res.body.created_by,
                'Functional Test - One field to update'
              );
              assert.equal(res.body.assigned_to, '');
              assert.equal(res.body.status_text, '');
              assert.isFalse(res.body.open);
              assert.isDefined(res.body.created_on);
              assert.isAbove(
                new Date(res.body.updated_on),
                new Date(res.body.created_on)
              );

              done();
            });
        });
    });

    test('Multiple fields to update', function (done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Multiple fields to update',
        })
        .end(function (err, res) {
          const { _id } = res.body;

          chai
            .request(server)
            .put('/api/issues/test')
            .send({
              _id,
              assigned_to: 'Chai and Mocha',
              status_text: 'In QA',
            })
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.type, 'application/json');
              assert.equal(res.body._id, _id);
              assert.equal(res.body.issue_title, 'Title');
              assert.equal(res.body.issue_text, 'text');
              assert.equal(
                res.body.created_by,
                'Functional Test - Multiple fields to update'
              );
              assert.equal(res.body.assigned_to, 'Chai and Mocha');
              assert.equal(res.body.status_text, 'In QA');
              assert.isTrue(res.body.open);
              assert.isDefined(res.body.created_on);
              assert.isAbove(
                new Date(res.body.updated_on),
                new Date(res.body.created_on)
              );

              done();
            });
        });
    });
  });

  suite(
    'GET /api/issues/{project} => Array of objects with issue data',
    function () {
      test('No filter', function (done) {
        chai
          .request(server)
          .get('/api/issues/test')
          .query({})
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            res.body.forEach((issue) => {
              assert.property(issue, 'issue_title');
              assert.property(issue, 'issue_text');
              assert.property(issue, 'created_on');
              assert.property(issue, 'updated_on');
              assert.property(issue, 'created_by');
              assert.property(issue, 'assigned_to');
              assert.property(issue, 'open');
              assert.property(issue, 'status_text');
              assert.property(issue, '_id');
            });

            done();
          });
      });

      test('One filter', function (done) {
        chai
          .request(server)
          .get('/api/issues/test')
          .query({
            open: false,
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            res.body.forEach((issue) => {
              assert.property(issue, 'issue_title');
              assert.property(issue, 'issue_text');
              assert.property(issue, 'created_on');
              assert.property(issue, 'updated_on');
              assert.property(issue, 'created_by');
              assert.property(issue, 'assigned_to');
              assert.isFalse(issue.open);
              assert.property(issue, 'status_text');
              assert.property(issue, '_id');
            });
            done();
          });
      });

      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function (done) {
        chai
          .request(server)
          .get('/api/issues/test')
          .query({
            open: false,
            assigned_to: 'Chai and Mocha',
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            res.body.forEach((issue) => {
              assert.property(issue, 'issue_title');
              assert.property(issue, 'issue_text');
              assert.property(issue, 'created_on');
              assert.property(issue, 'updated_on');
              assert.property(issue, 'created_by');
              assert.equal(issue.assigned_to, 'Chai and Mocha');
              assert.isTrue(issue.open);
              assert.property(issue, 'status_text');
              assert.property(issue, '_id');
            });
            done();
          });
      });
    }
  );

  suite('DELETE /api/issues/{project} => text', function () {
    test('No _id', function (done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Multiple fields to update',
        })
        .end(function (err, res) {
          const { _id } = res.body;

          chai
            .request(server)
            .delete('/api/issues/test')
            .send({})
            .end(function (err, res) {
              assert.equal(res.status, 400);
              assert.equal(res.type, 'application/json');
              assert.equal(res.body.error, 'missing _id');

              done();
            });
        });
    });

    test('Valid _id', function (done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Multiple fields to update',
        })
        .end(function (err, res) {
          const { _id } = res.body;

          chai
            .request(server)
            .delete('/api/issues/test')
            .send({
              _id,
            })
            .end(function (err, res) {
              assert.equal(res.status, 204);

              chai
                .request(server)
                .get('/api/issues/test')
                .query({
                  _id,
                })
                .end(function (err, res) {
                  assert.equal(res.status, 200);
                  assert.isArray(res.body);
                  assert.equal(res.body.length, 0);

                  done();
                });
            });
        });
    });
  });
});

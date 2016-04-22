/**
 * Common functions using in tests
 **/

var chai = require('chai');
var expect = chai.expect;
var config = require('../../config');


// make all users list
itHelper = {
    getAllUsersList: function (testEnv, keys) {
        var allUsers = [];
        if (keys.indexOf('superAdmin') !== -1){
            allUsers.push( // superAdmin
                {
                    firstName: testEnv.superAdmin.firstUser || 'SuperAdmin',
                    lastName: testEnv.superAdmin.lastUser || 'Test',
                    email: testEnv.superAdmin.email,
                    roleID: testEnv.superAdmin.roleID || 1,
                    password: testEnv.superAdmin.password
                }
            );
        }
        if (keys.indexOf('admin') !== -1) {
            allUsers.push( // admin
                {
                    firstName: testEnv.admin.firstUser || 'Admin',
                    lastName: testEnv.admin.lastUser || 'Test',
                    email: testEnv.admin.email,
                    roleID: testEnv.admin.roleID || 2,
                    password: testEnv.admin.password
                }
            );
        }
        // users
        if (keys.indexOf('users') !== -1) {
            for (var i in testEnv.users) {
                allUsers.push(testEnv.users[i]);
            }
        }
        return allUsers;
    },

    select : function (api, get, token, status, numberOfRecords, done) {
        api
            .get(get)
            .set('token', token)
            .expect(status)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                expect(res.body).to.exist;
                expect(res.body.length).to.equal(numberOfRecords);
                done();
            });
    },

    selectOneCheckField : function (api, get, token, status, name, value, done) {
        api
            .get(get)
            .set('token', token)
            .expect(status)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                expect(res.body).to.exist;
                expect(res.body[name]).to.equal(value);
                done();
            });
    },

    insertOne : function (api, get, token, insertItem, status, obj, key, done) {
        api
            .post(get)
            .set('token', token)
            .send(insertItem)
            .expect(status)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                obj[key] = res.body.id;
                done();
            });
    },
    insertOneErr : function (api, get, token, insertItem, status, errCode, done) {
        api
            .post(get)
            .set('token', token)
            .send(insertItem)
            .expect(status)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                expect(res.body.e).to.equal(errCode);
                done();
            });
    },
    deleteOne : function (api, get, token, status, done) {
        api
            .delete(get)
            .set('token', token)
            .expect(status)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                done();
            });
    },
    checkHeaderValue : function (api, get, token, status, headerName, headerValue, done) {
        api
            .get(get)
            .set('token', token)
            .expect(status)
            .expect(headerName, headerValue)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                //expect(res.headers['X-Total-Count'], 2);
                done();
            });
    },
    updateOne : function (api, get, token, updateItem, status, done) {
        api
            .put(get)
            .set('token', token)
            .send(updateItem)
            .expect(status)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                done();
            });
    }
};

module.exports = itHelper;

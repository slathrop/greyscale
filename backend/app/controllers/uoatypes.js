var client = require('app/db_bootstrap'),
    _ = require('underscore'),
    config = require('config'),
    UnitOfAnalysisType = require('app/models/uoatypes'),
    AccessMatrix = require('app/models/access_matrices'),
    Translation = require('app/models/translations'),
    Language = require('app/models/languages'),
    Essence = require('app/models/essences'),
    co = require('co'),
    Query = require('app/util').Query,
    getTranslateQuery = require('app/util').getTranslateQuery,
    detectLanguage = require('app/util').detectLanguage,
    query = new Query(),
    thunkify = require('thunkify'),
    HttpError = require('app/error').HttpError,
    thunkQuery = thunkify(query);

module.exports = {

    select: function (req, res, next) {
        co(function* () {
            var _counter = thunkQuery(UnitOfAnalysisType.select(UnitOfAnalysisType.count('counter')), _.omit(req.query, 'offset', 'limit', 'order'));
            var uoaType = thunkQuery(UnitOfAnalysisType.select(), req.query);
            return yield [_counter, uoaType];
        }).then(function (data) {
            res.set('X-Total-Count', _.first(data[0]).counter);
            res.json(_.last(data));
        }, function (err) {
            next(err);
        });
    },

    selectTranslated: function (req, res, next) {
        co(function* (){
            var langId = yield* detectLanguage(req);
            return yield thunkQuery(getTranslateQuery(langId, UnitOfAnalysisType));
        }).then(function(data){
            res.json(data);
        },function(err){
            next(err);
        })
    },

    selectOne: function (req, res, next) {
        var q = getTranslateQuery(req, UnitOfAnalysisType, UnitOfAnalysisType.id.equals(req.params.id));
        query(q, function (err, data) {
            if (err) {
                return next(err);
            }
            res.json(_.first(data));
        });
    },

    insertOne: function (req, res, next) {
        co(function* () {
            return yield thunkQuery(UnitOfAnalysisType.insert(req.body).returning(UnitOfAnalysisType.id));
        }).then(function (data) {
            res.status(201).json(_.first(data));
        }, function (err) {
            next(err);
        });
    },

    updateOne: function (req, res, next) {
        co(function* (){
            return yield thunkQuery(UnitOfAnalysisType.update(req.body).where(UnitOfAnalysisType.id.equals(req.body.id)));
        }).then(function(){
            res.status(202).end();
        },function(err){
            next(err);
        });
    },

    deleteOne: function (req, res, next) {
        co(function* (){
            return yield thunkQuery(UnitOfAnalysisType.delete().where(UnitOfAnalysisType.id.equals(req.params.id)));
        }).then(function(){
            res.status(204).end();
        },function(err){
            next(err);
        });
    }

};

var sql = require('sql');

var columns = [
    'id',
    'questionId',
    'userId',
    'value',
    'created',
    'optionId',
    'productId',
    'UOAid',
    'wfStepId',
    'version',
    'surveyId',
    'isResponse',
    'isAgree',
    'comments',
    'langId'

];

var SurveyAnswer = sql.define({
    name: 'SurveyAnswers',
    columns: columns
});

SurveyAnswer.editCols = [
    'value',
    'optionId',
    'isResponse',
    'comments'
];

SurveyAnswer.translate = [
    'value'
];


SurveyAnswer.whereCol = columns;

module.exports = SurveyAnswer;

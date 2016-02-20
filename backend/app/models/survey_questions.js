var sql = require('sql');

var columns = [
    'id',
    'surveyId',
    'type',
    'label',
    'isRequired',
    'position',
    'description',
    'skip',
    'size',
    'minLength',
    'maxLength',
    'isWordmml',
    'incOtherOpt',
    'units',
    'intOnly',
    'value',
    'qid',
    'links',
    'attachment'
];

var SurveyQuestion = sql.define({
    name: 'SurveyQuestions',
    columns: columns
});

SurveyQuestion.types = [
    0, // Text
    1, // Paragraph
    2, // Checkbox
    3, // Radio
    4, // Dropdown
    5, // Digit
    6, // Email
    7, // Currency
    8, // Section start
    9, // Section end
    10, // Section separator
    11, // Bullet points
    12 // Date
];
SurveyQuestion.multiSelectTypes = [2, 3, 4];

SurveyQuestion.editCols = [
    'label', 'position', 'isRequired', 'description',
    'skip', 'size', 'minLength', 'maxLength',
    'isWordmml', 'incOtherOpt', 'units', 'intOnly', 'value', 'qid'
];

SurveyQuestion.whereCol = columns;

module.exports = SurveyQuestion;

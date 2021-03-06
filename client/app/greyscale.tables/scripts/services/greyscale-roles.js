/**
 * Created by igi on 12/23/15.
 */
'use strict';
angular.module('greyscale.tables')
    .factory('greyscaleRolesTbl', function (greyscaleRoleApi) {

        var tns = 'ROLES.';

        var _getRoles = function () {
            return greyscaleRoleApi.list();
        };

        return {
            title: tns + 'ROLES',
            icon: 'fa-users',
            cols: [{
                field: 'id',
                title: 'ID',
                show: true,
                sortable: 'id'
            }, {
                field: 'name',
                title: tns + 'NAME',
                show: true,
                sortable: 'name'
            }, {
                field: 'isSystem',
                title: tns + 'SYSTEM_ROLE',
                show: true,
                sortable: 'isSystem',
                dataFormat: 'boolean'
            }],
            sorting: {
                'id': 'asc'
            },
            dataPromise: _getRoles,
            selectable: true
        };
    });

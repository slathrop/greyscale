/**
 * Created by igi on 22.12.15.
 */
'use strict';

angular.module('greyscale.tables')
    .factory('greyscaleProjects', function ($q, greyscaleGlobals, greyscaleUtilsSrv, greyscaleProjectSrv,
                                            greyscaleOrganizationSrv, greyscaleUserSrv, greyscaleAccessSrv,
                                            greyscaleModalsSrv, inform, $log) {

        var dicts = {
            matrices: [],
            orgs: [],
            users: [],
            states: greyscaleGlobals.project_states
        };

        var recDescr = [
            {
                field: 'id',
                show: false,
                sortable: 'id',
                title: 'id'
            },
            {
                field: 'organizationId',
                show: false,
                sortable: 'organizationId',
                title: 'organizationId'
            },
            {
                field: 'organization',
                show: true,
                sortable: 'organization',
                title: 'Organization'
            },
            {
                field: 'codeName',
                show: true,
                sortable: 'codeName',
                title: 'Code Name'
            },
            {
                field: 'description',
                show: true,
                sortable: false,
                title: 'Description'
            },
            {
                field: 'statusText',
                show: true,
                sortable: 'status',
                title: 'Status'
            },
            {
                field: 'created',
                dataFormat: 'date',
                show: true,
                sortable: 'created',
                title: 'Created'
            },
            {
                field: 'matrixId',
                show: false,
                sortable: 'matrixId',
                title: 'matrixId'
            },
            {
                field: 'startTime',
                dataFormat: 'date',
                show: true,
                sortable: 'startTime',
                title: 'Start Time'
            },
            {
                field: 'status',
                show: false,
                sortable: 'status',
                title: 'status'
            },
            {
                field: 'adminUserId',
                show: false,
                sortable: 'adminUserId',
                title: 'adminUserId'
            },
            {
                field: 'admin',
                show: true,
                sortable: 'admin',
                title: 'Admin'
            },
            {
                field: 'closeTime',
                dataFormat: 'date',
                show: true,
                sortable: 'closeTime',
                title: 'Close Time'
            },
            {
                field: '',
                title: '',
                show: true,
                dataFormat: 'action',
                actions: [
                    {
                        title: 'Edit',
                        class: 'info',
                        handler: _editProject
                    },
                    {
                        title: 'Delete',
                        class: 'danger',
                        handler: function (item) {
                            greyscaleProjectSrv.delete(item.id)
                                .then(reloadTable)
                                .catch(function (err) {
                                    errHandler(err, 'deleting');
                                });
                        }
                    }
                ]
            }];

        var _table = {
            title: 'Projects',
            icon: 'fa-paper-plane',
            cols: recDescr,
            dataPromise: _getData,
            add: {
                title: 'Add',
                handler: _editProject
            }
        };

        function _getData() {
            var req = {
                prjs: greyscaleProjectSrv.list(),
                orgs: greyscaleOrganizationSrv.list(),
                usrs: greyscaleUserSrv.list(),
                matrices: greyscaleAccessSrv.matrices()
            };

            return $q.all(req).then(function (promises) {
                for (var p = 0; p < promises.prjs.length; p++) {
                    promises.prjs[p].organization = greyscaleUtilsSrv.decode(promises.orgs, 'id', promises.prjs[p].organizationId, 'name');
                    promises.prjs[p].statusText = greyscaleUtilsSrv.decode(greyscaleGlobals.project_states, 'id', promises.prjs[p].status, 'name');
                    promises.prjs[p].admin = greyscaleUtilsSrv.decode(promises.usrs, 'id', promises.prjs[p].adminUserId, 'email');
                }
                dicts.matrices = promises.matrices;
                dicts.orgs = promises.orgs;
                dicts.users = promises.usrs;
                return promises.prjs;
            });
        }

        function _editProject(prj) {
            var op = 'editing';
            greyscaleModalsSrv.editProject(prj, dicts)
                .then(function (newPrj) {
                    delete newPrj.organization;
                    delete newPrj.statusText;
                    delete newPrj.admin;
                    $log.debug('edited project body',newPrj);
                    if (newPrj.id) {
                        return greyscaleProjectSrv.update(newPrj);
                    } else {
                        op = 'adding';
                        return greyscaleProjectSrv.add(newPrj);
                    }
                })
                .then(reloadTable)
                .catch(function (err) {
                    return errHandler(err, op);
                });
        }

        function reloadTable() {
            _table.tableParams.reload();
        }

        function errHandler(err, operation) {
            if (err) {
                var msg = 'Project ' + operation + ' error';
                $log.debug(err);
                if (err.data && err.data.message) {
                    msg += ': ' + err.data.message;
                }
                inform.add(msg, {type: 'danger'});
            }
        }

        return _table;
    });

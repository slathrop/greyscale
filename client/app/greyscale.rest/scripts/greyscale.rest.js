/**
 * Created by igi on 15.12.15.
 */
'use strict';

angular.module('greyscale.rest', ['restangular', 'greyscale.core'])
    .config(function (greyscaleEnv, RestangularProvider, greyscaleGlobalsProvider, greyscaleRoleSrvProvider) {
        RestangularProvider.setBaseUrl(greyscaleEnv.baseServerUrl);
        RestangularProvider.setDefaultHttpFields({
            cache: false,
            withCredentials: false
        });
        var greyscaleRoleApi = greyscaleRoleSrvProvider.$get();
        greyscaleRoleApi.list().then(greyscaleGlobalsProvider.initRoles);
    });

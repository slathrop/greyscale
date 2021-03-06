/**
 * Created by igi on 16.11.15.
 */
'use strict';

angular.module('greyscale.core')
    .service('greyscaleRestSrv', function (Restangular, greyscaleTokenSrv, $rootScope, greyscaleEnv, greyscaleRealmSrv) {
        return function (headers, realm) {
            headers = headers || {};

            var aHeaders = {
                'Content-Type': 'application/json',
                'Accept-Language': $rootScope.currentLocale
                    /*,
                    'If-Modified-Since': 'Mon, 26 Jul 1997 05:00:00 GMT',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                    */
            };

            angular.extend(aHeaders, headers);

            return Restangular.withConfig(function (RestangularConfigurer) {
                var token = greyscaleTokenSrv();
                var _realm = realm || greyscaleRealmSrv.current();

                if (token) {
                    angular.extend(aHeaders, {
                        token: token
                    });
                }

                if (_realm) {
                    RestangularConfigurer.setBaseUrl(
                        (greyscaleEnv.apiProtocol || 'http') + '://' +
                        greyscaleEnv.apiHostname +
                        (greyscaleEnv.apiPort !== undefined ? ':' + greyscaleEnv.apiPort : '') + '/' +
                        _realm + '/' +
                        greyscaleEnv.apiVersion
                    );
                }

                RestangularConfigurer.setDefaultHeaders(aHeaders);
            });
        };
    });

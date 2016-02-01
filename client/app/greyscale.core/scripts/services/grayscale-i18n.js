'use strict';

(function () {

    var env = _getNgModuleInject(angular.module('greyscale.core'), 'greyscaleEnv') || {};

    var languages = [{
        locale: 'en',
        label: 'English',
        flagUrl: 'images/flags/en.png'
    }, {
        locale: 'ru',
        label: 'Русский',
        flagUrl: 'images/flags/ru.png'
    }];

    window.L10N = _loadL10n;

    _injectL10N();

    ///////////////

    function _getLocales() {
        return env.supportedLocales || ['en'];
    }

    function _loadL10n(locale, l10n) {
        window.I18N = {
            locale: locale,
            translations: l10n,
            languages: languages,
            locales: _getLocales()
        };
        delete window.L10N;
        _runNgApp();
    }

    function _injectL10N() {
        var locale = getLocale();
        _injectScript('l10n/' + locale + '.js');
        if (locale !== 'en') {
            _injectScript('l10n/angular-locale/angular-locale_' + locale + '.js', _initNgLocale);
        }
    }

    function _injectScript(src, callback) {
        var script = document.createElement('script');
        script.src = src;
        document.head.appendChild(script);
        script.onreadystatechange = script.onload = callback;
    }

    function getLocale() {
        var locales = _getLocales();
        var locale = _getCookie('locale');
        if (locale && locales.indexOf(locale) >= 0) {
            return locale;
        } else {
            return locales[0];
        }
    }

    function _runNgApp() {
        angular.element(document).ready(function () {
            angular.bootstrap(document.body, ['greyscaleApp']);
        });
    }

    function _initNgLocale() {
        window.i18nNgLocaleLoaded = true;
    }

    function _getCookie(name) {
        return (document.cookie.match('(^|; )' + name + '=([^;]*)') || 0)[2];
    }

    function _getNgModuleInject(module, injectName) {
        var inj = module._invokeQueue;
        var i, c;
        if (inj && inj.length) {
            for (i in inj) {
                if (!inj.hasOwnProperty(i)) {
                    continue;
                }
                for (c in inj[i]) {
                    if (!inj[i].hasOwnProperty(c)) {
                        continue;
                    }
                    if (inj[i][c][0] === injectName) {
                        return inj[i][c][1];
                    }
                }
            }
        }
    }

})();

angular.module('greyscale.core')
    .provider('i18n', function i18nProvider() {
        var _locale,
            _locales,
            _languages,
            _cookies,
            pub = {
                getLocale: _getLocale,
                getLocales: _getLocales,
                getLanguages: _getLanguages,
                isSupported: _isSupported,
                changeLocale: _changeLocale
            };

        function _init(translateProvider) {

            if (typeof window.I18N !== 'object') {
                throw 'Expected global I18N object!';
            }

            _locale = window.I18N.locale;
            _locales = window.I18N.locales;
            _languages = window.I18N.languages;

            translateProvider.translations(_locale, window.I18N.translations);
            translateProvider.preferredLanguage(_locale);
            translateProvider.useSanitizeValueStrategy(null);

            delete(window.I18N);
        }

        function _changeLocale(locale) {
            if (locale !== _locale && _isSupported(locale)) {
                _cookies.put('locale', locale);
                window.location.reload();
            }
        }

        function _getLocale() {
            return _locale;
        }

        function _getLocales() {
            return _locales;
        }

        function _getLanguages() {
            return _languages;
        }

        function _isSupported(locale) {
            return _locales.indexOf(locale) >= 0;
        }

        return {
            init: _init,
            useNgLocale: pub.useNgLocale,
            $get: ['$cookies', '$translate', '$rootScope', function ($cookies, $translate, $rootScope) {
                $translate.use(_locale);
                _cookies = $cookies;
                pub.translate = $translate.instant;
                $rootScope.currentLocale = _locale;

                return pub;
            }]
        };
    })
    .run(function (uibDatepickerPopupConfig, $locale, i18n) {

        _resolveNgLocaleLoading();

        var datepickerPopupL10n = {
            clearText: t('RESET'),
            closeText: t('DONE'),
            currentText: t('TODAY'),
            datepickerPopup: t('DATE_FORMAT')
        };

        angular.extend(uibDatepickerPopupConfig, datepickerPopupL10n);

        function t(key, data) {
            return i18n.translate('DATEPICKER.' + key, data);
        }

        function _resolveNgLocaleLoading() {
            if (i18n.getLocale() === 'en') {
                return;
            }
            if (window.i18nNgLocaleLoaded) {
                delete(window.i18nNgLocaleLoaded);
                return;
            }
            var loop = setInterval(function () {
                if (window.i18nNgLocaleLoaded) {
                    delete(window.i18nNgLocaleLoaded);
                    clearInterval(loop);
                    _initNewNgLocale();
                }
            }, 15);
        }

        function _initNewNgLocale() {
            var injector = angular.injector(['ngLocale']),
                newLocale = injector.get('$locale');
            angular.extend($locale, newLocale);
        }
    });
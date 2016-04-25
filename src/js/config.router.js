'use strict';

/**
 * Config for the router
 */
angular.module('app')
  .run(
    [          '$rootScope', '$state', '$stateParams',
      function ($rootScope,   $state,   $stateParams) {
          $rootScope.$state = $state;
          $rootScope.$stateParams = $stateParams;        
      }
    ]
  )
  .config(
    [          '$stateProvider', '$urlRouterProvider', 'JQ_CONFIG',
      function ($stateProvider,   $urlRouterProvider, JQ_CONFIG) {
          
        $urlRouterProvider
            .otherwise('/app/home');
        $stateProvider
            .state('app', {
                abstract: true,
                url: '/app',
                templateUrl: 'angular/src/tpl/app.html'
            })
            .state('app.home', {
                url: '/home',
                templateUrl: 'angular/src/tpl/home.html',
                resolve: {
                  deps: ['$ocLazyLoad',
                    function( $ocLazyLoad ){
                        //return $ocLazyLoad.load(['angular/src/js/controllers/home.js']);
                        return $ocLazyLoad.load('angularFileUpload').then(
                            function(){
                               return $ocLazyLoad.load('angular/src/js/controllers/home.js');
                            }
                        );
                  }]
                }
            })
            .state('app.designer', {
                url: '/designer/:designId',
                templateUrl: 'angular/src/tpl/designer.html',
                reloadOnSearch: false,
                resolve: {
                  deps: ['$ocLazyLoad',
                    function( $ocLazyLoad ){
                        return $ocLazyLoad.load('angularFileUpload').then(
                            function(){
                               return $ocLazyLoad.load('angular/src/js/controllers/designer.js');
                            }
                        );
                  }]
                }
            })
            .state('app.exporter', {
                url: '/exporter',
                templateUrl: 'angular/src/tpl/exporter.html',
                resolve: {
                  deps: ['$ocLazyLoad',
                    function( $ocLazyLoad ){
                      return $ocLazyLoad.load(['angular/src/js/controllers/exporter.js']);
                  }]
                }
            })
      }
    ]
  );

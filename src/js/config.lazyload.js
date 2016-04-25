// lazyload config

angular.module('app')
    /**
   * jQuery plugin config use ui-jq directive , config the js and css files that required
   * key: function name of the jQuery plugin
   * value: array of the css js file located
   */
  .constant('JQ_CONFIG', {
      easyPieChart:   [   'angular/bower_components/jquery.easy-pie-chart/dist/jquery.easypiechart.fill.js'],
      sparkline:      [   'angular/bower_components/jquery.sparkline/dist/jquery.sparkline.retina.js'],
      plot:           [   'angular/bower_components/flot/jquery.flot.js',
                          'angular/bower_components/flot/jquery.flot.pie.js', 
                          'angular/bower_components/flot/jquery.flot.resize.js',
                          'angular/bower_components/flot.tooltip/js/jquery.flot.tooltip.js',
                          'angular/bower_components/flot.orderbars/js/jquery.flot.orderBars.js',
                          'angular/bower_components/flot-spline/js/jquery.flot.spline.js'],
      moment:         [   'angular/bower_components/moment/moment.js'],
      screenfull:     [   'angular/bower_components/screenfull/dist/screenfull.min.js'],
      slimScroll:     [   'angular/bower_components/slimscroll/jquery.slimscroll.min.js'],
      sortable:       [   'angular/bower_components/html5sortable/jquery.sortable.js'],
      nestable:       [   'angular/bower_components/nestable/jquery.nestable.js',
                          'angular/bower_components/nestable/jquery.nestable.css'],
      filestyle:      [   'angular/bower_components/bootstrap-filestyle/src/bootstrap-filestyle.js'],
      slider:         [   'angular/bower_components/bootstrap-slider/bootstrap-slider.js',
                          'angular/bower_components/bootstrap-slider/bootstrap-slider.css'],
      chosen:         [   'angular/bower_components/chosen/chosen.jquery.min.js',
                          'angular/bower_components/bootstrap-chosen/bootstrap-chosen.css'],
      TouchSpin:      [   'angular/bower_components/bootstrap-touchspin/dist/jquery.bootstrap-touchspin.min.js',
                          'angular/bower_components/bootstrap-touchspin/dist/jquery.bootstrap-touchspin.min.css'],
      wysiwyg:        [   'angular/bower_components/bootstrap-wysiwyg/bootstrap-wysiwyg.js',
                          'angular/bower_components/bootstrap-wysiwyg/external/jquery.hotkeys.js'],
      dataTable:      [   'angular/bower_components/datatables/media/js/jquery.dataTables.min.js',
                          'angular/bower_components/plugins/integration/bootstrap/3/dataTables.bootstrap.js',
                          'angular/bower_components/plugins/integration/bootstrap/3/dataTables.bootstrap.css'],
      vectorMap:      [   'angular/bower_components/bower-jvectormap/jquery-jvectormap-1.2.2.min.js', 
                          'angular/bower_components/bower-jvectormap/jquery-jvectormap-world-mill-en.js',
                          'angular/bower_components/bower-jvectormap/jquery-jvectormap-us-aea-en.js',
                          'angular/bower_components/bower-jvectormap/jquery-jvectormap-1.2.2.css'],
      footable:       [   'angular/bower_components/footable/dist/footable.all.min.js',
                          'angular/bower_components/footable/css/footable.core.css'],
      fullcalendar:   [   'angular/bower_components/moment/moment.js',
                          'angular/bower_components/fullcalendar/dist/fullcalendar.min.js',
                          'angular/bower_components/fullcalendar/dist/fullcalendar.css',
                          'angular/bower_components/fullcalendar/dist/fullcalendar.theme.css'],
      daterangepicker:[   'angular/bower_components/moment/moment.js',
                          'angular/bower_components/bootstrap-daterangepicker/daterangepicker.js',
                          'angular/bower_components/bootstrap-daterangepicker/daterangepicker-bs3.css'],
      tagsinput:      [   'angular/bower_components/bootstrap-tagsinput/dist/bootstrap-tagsinput.js',
                          'angular/bower_components/bootstrap-tagsinput/dist/bootstrap-tagsinput.css']
                      
    }
  )
  // oclazyload config
  .config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
      // We configure ocLazyLoad to use the lib script.js as the async loader
      $ocLazyLoadProvider.config({
          debug:  true,
          events: true,
          modules: [
              {
                  name: 'ngGrid',
                  files: [
                      'angular/bower_components/ng-grid/build/ng-grid.min.js',
                      'angular/bower_components/ng-grid/ng-grid.min.css',
                      'angular/bower_components/ng-grid/ng-grid.bootstrap.css'
                  ]
              },
              {
                  name: 'ui.grid',
                  files: [
                      'angular/bower_components/angular-ui-grid/ui-grid.min.js',
                      'angular/bower_components/angular-ui-grid/ui-grid.min.css',
                      'angular/bower_components/angular-ui-grid/ui-grid.bootstrap.css'
                  ]
              },
              {
                  name: 'ui.select',
                  files: [
                      'angular/bower_components/angular-ui-select/dist/select.min.js',
                      'angular/bower_components/angular-ui-select/dist/select.min.css'
                  ]
              },
              {
                  name:'angularFileUpload',
                  files: [
                    'angular/bower_components/angular-file-upload/angular-file-upload.min.js'
                  ]
              },
              {
                  name:'ui.calendar',
                  files: ['angular/bower_components/angular-ui-calendar/src/calendar.js']
              },
              {
                  name: 'ngImgCrop',
                  files: [
                      'angular/bower_components/ngImgCrop/compile/minified/ng-img-crop.js',
                      'angular/bower_components/ngImgCrop/compile/minified/ng-img-crop.css'
                  ]
              },
              {
                  name: 'angularBootstrapNavTree',
                  files: [
                      'angular/bower_components/angular-bootstrap-nav-tree/dist/abn_tree_directive.js',
                      'angular/bower_components/angular-bootstrap-nav-tree/dist/abn_tree.css'
                  ]
              },
              {
                  name: 'toaster',
                  files: [
                      'angular/bower_components/angularjs-toaster/toaster.js',
                      'angular/bower_components/angularjs-toaster/toaster.css'
                  ]
              },
              {
                  name: 'textAngular',
                  files: [
                      'angular/bower_components/textAngular/dist/textAngular-sanitize.min.js',
                      'angular/bower_components/textAngular/dist/textAngular.min.js'
                  ]
              },
              {
                  name: 'vr.directives.slider',
                  files: [
                      'angular/bower_components/venturocket-angular-slider/build/angular-slider.min.js',
                      'angular/bower_components/venturocket-angular-slider/build/angular-slider.css'
                  ]
              },
              {
                  name: 'com.2fdevs.videogular',
                  files: [
                      'angular/bower_components/videogular/videogular.min.js'
                  ]
              },
              {
                  name: 'com.2fdevs.videogular.plugins.controls',
                  files: [
                      'angular/bower_components/videogular-controls/controls.min.js'
                  ]
              },
              {
                  name: 'com.2fdevs.videogular.plugins.buffering',
                  files: [
                      'angular/bower_components/videogular-buffering/buffering.min.js'
                  ]
              },
              {
                  name: 'com.2fdevs.videogular.plugins.overlayplay',
                  files: [
                      'angular/bower_components/videogular-overlay-play/overlay-play.min.js'
                  ]
              },
              {
                  name: 'com.2fdevs.videogular.plugins.poster',
                  files: [
                      'angular/bower_components/videogular-poster/poster.min.js'
                  ]
              },
              {
                  name: 'com.2fdevs.videogular.plugins.imaads',
                  files: [
                      'angular/bower_components/videogular-ima-ads/ima-ads.min.js'
                  ]
              },
              {
                  name: 'xeditable',
                  files: [
                      'angular/bower_components/angular-xeditable/dist/js/xeditable.min.js',
                      'angular/bower_components/angular-xeditable/dist/css/xeditable.css'
                  ]
              },
              {
                  name: 'smart-table',
                  files: [
                      'angular/bower_components/angular-smart-table/dist/smart-table.min.js'
                  ]
              }
          ]
      });
  }])
;

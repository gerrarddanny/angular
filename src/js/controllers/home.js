'use strict';
/* Controllers */
app.controller('HomeCtrl', 
        ['$http','$state','$rootScope','$scope',
function($http,$state,$rootScope,$scope) {
/*
 * Get objects,templates,designs by mode_id and backgrounds
 */
    $rootScope.designState = {
        isTempDesign:false,
        isDesign:false
    };
    $http.post('/designer/get-designs').
        success(function(data, status, headers, config) {
            $rootScope.canvasDesigns = data.designs;
            $rootScope.canvasTempDesigns = data.tempDesigns;
            $rootScope.auth = data.auth;
            //Check the app autentication
            if(!data.auth)
                window.location = '/';
        });

    $scope.selectTempDesign = function(mode){
        $rootScope.designState.isTempDesign = true;
        $rootScope.designState.isDesign = false;
        $rootScope.mode = mode;
        if($rootScope.canvasTempDesigns){
            var canvas_background = JSON.parse($rootScope.canvasTempDesigns.canvas_background);
            $rootScope.BackgroundFilePath     = canvas_background.file;
            $rootScope.BackgroundFilePosition = canvas_background.position;
            var canvasSize = JSON.parse($rootScope.canvasTempDesigns.canvas_size);
            $rootScope.canvasCenter = {
                top  : canvasSize.height,
                left : canvasSize.width
            };
            $rootScope.selectedPreset = true;
            $rootScope.tempDesignSelected = true;
            $rootScope.designSelected = false;
        }
        else{
            alert('Something went wrong');
            return false;
        }
    };

    $scope.selectDesign = function( design,mode ){
        var canvas_background = JSON.parse(design.canvas_background);
        $rootScope.BackgroundFilePath     = canvas_background.file;
        $rootScope.BackgroundFilePosition = canvas_background.position;
        
        var canvasSize = JSON.parse( design.canvas_size );
        $rootScope.canvasCenter = {
            top : canvasSize.height,
            left: canvasSize.width
        };
        $rootScope.designState.isTempDesign = false;
        $rootScope.designState.isDesign = true;
        $rootScope.mode = mode;
        $rootScope.selectedPreset = true;
        $rootScope.designSelected = true;
        $rootScope.tempDesignSelected = false;
        $rootScope.selectedDesign = design;
    };
    $scope.modes = [
        {id:1,name:'Logo'},
        {id:2,name:'Books'}
    ];
    $scope.canvasPresets = [
        {id:0,mode_id:1, title : 'Custom Preset'},
        {id:1,mode_id:1, title : 'Portrait (8.5 x 11)'},
        {id:2,mode_id:1, title : 'Landscape (11 x 8.5)'},
        {id:3,mode_id:1, title : 'Business Card (3.5 x 2)'},
        {id:4,mode_id:1, title : 'Postcard (6 x 4)'},
        {id:5,mode_id:1, title : 'Content/Builder Product Thumbnail'},
        {id:6,mode_id:1, title : 'Badge'},
        {id:7,mode_id:1, title : 'Facebook Profile Picture'},
        {id:8,mode_id:1, title : 'Facebook Cover Picture'},
        {id:9,mode_id:1, title : 'Facebook Photo Post (Landscape)'},
        {id:10,mode_id:1, title : 'Facebook Photo Post (Horizonal)'},
        {id:11,mode_id:1, title: 'Facebook Full-Width Photo Post'}
    ];
    $rootScope.canvasPresetSizes = [
        {width:300,height:300},
        {width:906,height:1168},
        {width:1168,height:906},
        {width:378,height:220},
        {width:640.8,height:430.8},
        {width:456,height:240},
        {width:240,height:240},
        {width:180,height:180},
        {width:510.6,height:189},
        {width:241.8,height:302.4},
        {width:483.6,height:604.8},
        {width:505.8,height:302.4}
    ];

    $rootScope.fontFamilies = [
        {name:'Arial'},
        {name:'Lora'},
        {name:'Croissant One'},
        {name:'Architects Daughter'},
        {name:'Emblema One'},
        {name:'Graduate'},
        {name:'Hammersmith One'},
        {name:'Oswald'},
        {name:'Oxygen'},
        {name:'Krona One'},
        {name:'Indie Flower'},
        {name:'Courgette'},
        {name:'Gruppo'},
        {name:'Ranchers'}
    ];
    $rootScope.canvasbackGrounds = {aaa:222222};
    $rootScope.BackgroundFilePath = false;
    $rootScope.selectedPreset = false;
    $rootScope.showBlock = false;
    $rootScope.hasDesigner = false;
    $rootScope.mode = 'logo';
    /*Buttons*/
    $rootScope.buttons = {
        undo : true,
        redo : true,
        isolationMode : true,
        groupingToggleButtonStyle : {'display':'none'}
    };

    $rootScope.choosePreset = function(preset_id, mode ){
        $rootScope.tempDesignSelected = false;
        $rootScope.designSelected = false;
        $rootScope.presetId = preset_id;
        $rootScope.mode = mode;
        $rootScope.selectedPreset = $rootScope.canvasPresetSizes[preset_id];
        var canvasSize = $rootScope.selectedPreset;
        $rootScope.canvasCenter = {
            top : canvasSize.height,
            left : canvasSize.width
        };
        $state.go('app.designer');
    };
}]);
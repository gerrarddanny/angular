'use strict';
/* Controllers */
app 
.controller('ExporterCtrl', ['$http','$scope','$rootScope','$state', function($http,$scope,$rootScope,$state) {
/*
* Check the app autentication
*/
    if(!$rootScope.auth){
        window.location = '/';
    }
    if(!$rootScope.selectedPreset){
        $state.go('app.home');
        return false;
    }
    if($rootScope.designState.isTempDesign)
        $http.get('designer/get-design/'+$rootScope.designId).success(function(response){
            if(response.success){
                $rootScope.designState.isDesign = true;
            }
        });
    var tempDesign,tempDesignId;
    if( tempDesign = $rootScope.canvasTempDesigns){
            tempDesignId = tempDesign.id

    }
    $rootScope.hasDesigner = false;
    var canvas = $rootScope.canvas;
    
/* 
 * Get active objects position for croping
 * @return (object) cropData
 */

    function getCropData( canvas ){
        var cropData = {};
            var objs = canvas.getObjects().map(function(o) {
                return o.set('active', true);
              });

        var group = new fabric.Group(objs);
        canvas._activeObject = null;
        cropData.width = group.width;
        cropData.height = group.height;
        cropData.top = group.top;
        cropData.left = group.left;
        canvas.setActiveGroup(group.setCoords()).renderAll();
        return cropData;
    };
/*
 * Save only objects
 */
    $scope.saveCanvasObjects = function(){
        var img = canvas.toDataURL("image/png");
        var content = JSON.stringify(canvas.getObjects());
        //Crop Data
        var cropData = getCropData(canvas);
        //end Crop Data
        $http.post('/designer/save-objects', {
            content : content,
            mode_id : $rootScope.mode.id,
            cropData: cropData,
            tempDesignId: tempDesignId,
            img:img}).
            success(function(data, status, headers, config) {
                if(data.success)
                    $state.go('app.home');
                else
                    alert('something wet wrong')
            });
    };

/*
 * Save only templates
 */
    $scope.saveCanvasTemplates = function(){
        var img = canvas.toDataURL("image/png");
        var objects = JSON.stringify(canvas.getObjects());
        var canvas_size = JSON.stringify({
            width:canvas.getWidth(),
            height:canvas.getHeight()
        });
        var cropData = getCropData(canvas);
        $http.post('/designer/save-templates', {
            objects:objects,
            canvas_size:canvas_size,
            mode_id : $rootScope.mode.id,
            cropData:cropData,
            tempDesignId: tempDesignId,
            img:img}).
            success(function(data, status, headers, config) {
                $state.go('app.home');
            });
    };

/*
 * Save only designs
 */
    $scope.saveCanvasDesigns = function(designState){
        
        var designId = false;
        var update = false;
        if($rootScope.designState.isTempDesign && designState == 'new'){
            designId = $rootScope.designId;
        }
        if($rootScope.designState.isDesign && designState == 'update'){
            designId = $rootScope.designId;
            update = true;
        }
        var img = canvas.toDataURL("image/png");
        var objects = JSON.stringify(canvas.getObjects());
        var canvas_size = JSON.stringify({
            width:canvas.getWidth(),
            height:canvas.getHeight()
        });
        var cropData = getCropData(canvas);
        var canvas_background = {};
        if( $rootScope.BackgroundFilePath ){
            canvas_background = {
                file : $rootScope.BackgroundFilePath,
                position : $rootScope.BackgroundFilePosition,
            };
        }
        $http.post('/designer/save-designs', {
            update : update,
            objects : objects,
            canvas_size:canvas_size,
            mode_id : $rootScope.mode.id,
            preset_id: $rootScope.presetId,
            cropData :cropData,
            tempDesignId: designId,
            canvas_background: JSON.stringify(canvas_background),
            img:img}).
            success(function(data, status, headers, config){
                $state.go('app.home');
            });
    };

/*
 * Download Canvas as Image or as PDF 
 */
    var downloadCanvas = function(){
        canvas.deactivateAll();
        var img = new Image();
        img.src = canvas.toDataURL('image/png');
        var dataURL = canvas.toDataURL();
        var blobBin = atob(dataURL.split(',')[1]);
        var array = [];
        for (var i = 0; i < blobBin.length; i++) {
            array.push(blobBin.charCodeAt(i));
        }
        $scope.canvasImageDataUrl = img.src;
        $http.post('/designer/pdf', {
            svg:canvas.toSVG(),
            size:{width:canvas.getWidth(), height:canvas.getHeight()}
        }).
            success(function( data, status, headers, config ){
                $scope.canvasPdfDataUrl = data.pdfPath;
            });
    };
    downloadCanvas();
}]);

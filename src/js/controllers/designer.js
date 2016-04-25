'use strict';
/* Controllers */
app.controller('DesignerCtrl', ['$stateParams','FileUploader','$http','$location','$state','$scope','$rootScope','$element', 
    function($stateParams,FileUploader,$http,$location,$state, $scope, $rootScope,$element) {
/*
* Check the app autentication
*/
if(!$rootScope.auth){
    window.location = '/';
}
/*
* Check the route params
*/
if($stateParams.designId){
    $rootScope.designId = $stateParams.designId;
    
    $http.post('/designer/get-temp-designs').
        success(function(data, status, headers, config) {
            if(data.success){
                $rootScope.addDesignsIntoCanvas( data.tempDesigns );
                $rootScope.designSelected = false;
            }
        });
}
/*
* If $rootScope.selectedPreset = false redirect to app.home and breacke
*/
if( !$rootScope.selectedPreset ){
    $state.go('app.home');
    return false;
}

$rootScope.hasDesigner = true;
/*
 * Init canvas data
 */

    $scope.transformedImageName = 'transformedImage';
    $rootScope.images = [];
    $scope.objetsTypes = ['img','object'];
    $rootScope.canvasTextObj = {};
    $rootScope.canvasObjects = {opacity:1};
    $rootScope.canvasTemplates = {};
    $rootScope.canvasDesigns = {};
    $rootScope.canvasbackGrounds = {};
    $scope.tempDesign = {};
    //check if exists temp design id
    if( $rootScope.canvasTempDesigns )
        $scope.tempDesign.id = $rootScope.canvasTempDesigns.id;
    $scope.InputAll = {};
    $scope.histories = [];
    $scope.historyStep = 0;
    $rootScope.groupingToggleData = {
        state:false
    };
    $scope.isolationMode = {
        mode : false,
        oldGroupId: false,
    };

    $scope.canvasSelectedObjects = {objects:[]};
    $rootScope.showBlock = false;

    var canvas = $rootScope.canvas = $scope.canvas = new fabric.Canvas('c', {
        backgroundColor: '#ffffff',
        width : $rootScope.canvasCenter.left,
        height: $rootScope.canvasCenter.top
    });
/*End Init canvas data */

    //Get uploaded images for background
    $http.get('designer/backgrounds').success(function(resourse){
        if(resourse.success){
            $rootScope.canvasbackGrounds = resourse.backgrounds;
        }else{
            console.log(resourse.message);
        }
    });
/* End Requests */

/* 
 * Adding image into canvas and activate it
 */
    $scope.fabricAddImageIntoCanvas = function(path){
        fabric.Image.fromURL(path, function(img) {
            var scale,
            scaleX = canvas.getWidth()/img.width,
            scaleY = canvas.getHeight()/img.height;
            if( img.width >= canvas.getWidth() || img.height >= canvas.getHeight()){
                if( scaleX >= scaleY )
                    scale = scaleY;
                else
                    scale = scaleX;
            }
            img.set(
                    {
                        scaleX : scale,
                        scaleY : scale
                    }
            );
            canvas.add(img);
            canvas.renderAll();
            canvas.setActiveObject(img);
          },{crossOrigin: 'anonymous'});
    };
    
/* 
 * Adding text into canvas and return it
 * @return (object) new fabric.IText
 */

    $scope.fabricAddText = function(){
        var text = new fabric.IText('Hello world !!!', {textAlign:'center',fontSize:18});
        canvas.add(text);
        return text;
    }

/* 
 * Event fired when object modified
 */
    function saveTempDesign(){
        var active = canvas.getActiveObject();
        if( active && !isEmpty(canvas.getItemsByName(active.name)) ){
            $rootScope.BackgroundFilePosition = {
                top     : active.top,
                left    : active.left,
                scaleX  : active.scaleX,
                scaleY  : active.scaleY,
                originX : active.originX,
                originY : active.originY
            };
        }
        var objects = JSON.stringify(canvas.getObjects());
        var file = canvas.toDataURL('image/png');
        var canvas_size = JSON.stringify({
            width:canvas.getWidth(),
            height:canvas.getHeight()
        });
        var canvas_background = {};
        if( $rootScope.BackgroundFilePath ){
            canvas_background.file     = $rootScope.BackgroundFilePath;
            canvas_background.position = $rootScope.BackgroundFilePosition;
        }
        canvas_background = JSON.stringify( canvas_background );
        //Send temp-design data for saving
        $http.post( 'designer/save-temp-design', {
            id                 : $rootScope.designId,
            imageThumb         : file,
            objects            : objects,
            canvas_size        : canvas_size,
            canvas_background  : canvas_background,
            mode_id            : $rootScope.mode.id,
            preset_id          : $rootScope.presetId
        }).
            success(function(resourse) {
                if(resourse.success){
                    $scope.tempDesign.id = resourse.tempDesignId;
                    $location.path('app/designer/'+resourse.tempDesignId).replace();
                    if(!$rootScope.designId)
                        $rootScope.designId = resourse.tempDesignId;
                }
            });
    }
    canvas.on('object:modified', function(options){
        var objects = JSON.stringify(canvas.getObjects());
        var canvas_size = JSON.stringify({
            width:canvas.getWidth(),
            height:canvas.getHeight()
        });
        removeSnapLines();
        saveTempDesign(objects);
        //Add into histories
        if( $scope.histories.length > 10 ){
            $scope.histories.splice(0,1);
        }
        $scope.histories.push({
            objects:objects,
            canvas_size:canvas_size,
            canvas_background : JSON.stringify({
                    file : $rootScope.BackgroundFilePath,
                    position : $rootScope.BackgroundFilePosition,
            })
        });
        //end Add into histories
        $rootScope.buttons.undo = false;
        $scope.historyStep = $scope.histories.length-1;
    });

 /* 
 * Enter Isolation Mode
 * @return objectList.beforeIsolatedObjects
 * @return objectList.afterIsolatedObjects
 */
    fabric.Canvas.prototype.getIsolatedObjects = function() {
        if(!$scope.isolationMode.mode){
            var objectList = {},
                objects = this.getObjects(),
                afterIsolatedObjects = [],
                beforeIsolatedObjects = [];

            for (var i = 0, len = objects.length; i < len; i++) {
                if ((typeof  objects[i].isolated == 'undefined' || objects[i].isolated == true) && objects[i].name != 'isolationRect'  ) {
                    afterIsolatedObjects.push(objects[i]);
                }
                if(objects[i].isolated == false){
                    beforeIsolatedObjects.push(objects[i]);
                }
            }
            objectList.beforeIsolatedObjects = beforeIsolatedObjects;
            objectList.afterIsolatedObjects = afterIsolatedObjects;
            return objectList;
        }
    };

 /* 
 * Exit from isolation mode
 */
    $rootScope.exitIsolation = function (){
            $scope.isolationMode.mode = false;
            var objects = canvas.getIsolatedObjects();
            canvas.clear();
            var beforeIsolatedObjects = objects.beforeIsolatedObjects;
            var afterIsolatedObjects = objects.afterIsolatedObjects;

            for(var bo in beforeIsolatedObjects){
                beforeIsolatedObjects[bo].isolated = false;
                beforeIsolatedObjects[bo].selectable = true;
                canvas.add(beforeIsolatedObjects[bo]);
            }

            for(var ao in afterIsolatedObjects){
                afterIsolatedObjects[ao].isolated = false;
                afterIsolatedObjects[ao].selectable = true;
            }
            $rootScope.addObjectsIntoCanvas(1,JSON.stringify(afterIsolatedObjects) , $scope.isolationMode.oldGroupId);
    };

/*
 * Switch state of the objects
 * 
 * @param var objects {type}Object
 * @param var excludedObjectName {type}string
 * @param var type {type}Boolean
 * @returns {undefined}*
 */
    function switchObjectsSate( canvas , excludedObjectName , type){
        var excludedObject = canvas.getItemsByName(excludedObjectName)[0];
        canvas.forEachObject(function(o) {
            if(o != excludedObject && type =='off'){
                o.selectable = false;
                o.evented    = false;
            }
            if(type =='on'){
                canvas.remove(excludedObject);
                o.selectable = true;
                o.evented    = true;
            }
        });
    }

/*
 * Background transform to Image
 */
    function backgroundToImage( imagePath ){
        $scope.backGroundIsset = false;
        var imageName = $scope.transformedImageName;
        $rootScope.canvasbackGrounds.transforming = true;
        $rootScope.BackgroundFilePath = '';
        canvas.backgroundImage = false;
        fabric.Image.fromURL(imagePath, function(oImg) {
            var attrs = $rootScope.BackgroundFilePosition;
            attrs.name = imageName;
            attrs.path = imagePath;
            oImg.set(attrs);
            canvas.add(oImg);
            canvas.setActiveObject(oImg);
            if(typeof $rootScope.canvasbackGrounds.top != 'undefined'){
                var active = canvas.getActiveObject();
                active.scaleX = $rootScope.canvasbackGrounds.scaleX;
                active.scaleY = $rootScope.canvasbackGrounds.scaleY;
                active.top = $rootScope.canvasbackGrounds.top;
                active.left = $rootScope.canvasbackGrounds.left;
            }
            
            canvas.sendToBack(oImg);
            canvas.renderAll();
        },{crossOrigin: 'anonymous'});
        canvas.renderAll();
        switchObjectsSate(canvas,imageName,'off');
    }


/*
 * Image transform to Background
 */
    function imageToBackground( image ){
        $scope.backGroundIsset = true;
        var active = canvas.getActiveObject();
        switchObjectsSate(canvas,$scope.transformedImageName,'on');
        $rootScope.addBackgroundIntoCanvas({
            file : image,
            position : {
                top    : active.top,
                left   : active.left,
                scaleX : active.scaleX,
                scaleY : active.scaleY,
                originX: active.originX,
                originY: active.originY
            }
        },false);
    }

/*
 * Dbl Click handler
 */
    fabric.util.addListener(fabric.document, 'dblclick', dblClickHandler);
    function dblClickHandler(e)
    {
        var canvasLayer = e.target.tagName;
        var canvasObjects = canvas.getObjects();

        var activeObject = canvas.getActiveObject();
        var activeGroup = canvas.getActiveGroup();
        //Check the double click only on canvas element
        if(typeof canvasLayer !=='undefined' && canvasLayer == 'CANVAS' ){
            //Background transform (positioning)
            if($scope.backGroundIsset && $scope.backGroundSelected){
                backgroundToImage($rootScope.BackgroundFilePath);
            } else {
                if(activeObject && activeObject.name === $scope.transformedImageName)
                {
                    imageToBackground(activeObject.path);
                }
            }
            //End Background transform (positioning)

            //Exit isiolation after dblClick
            if(activeObject && activeObject.get('type') === 'rect' && !isEmpty(canvas.getItemsByName('isolationRect'))){
                $scope.isolationMode.mode = false;
                canvas.deactivateAll();
                $rootScope.exitIsolation();
            }
            //End Exit isiolation after dblClick

            //Begin Isolation after dblClick
            if(activeObject && activeObject.get('type') === 'group' && !$scope.isolationMode.mode){
                //fixing group position in array canvas objects
                $scope.isolationMode.oldGroupId = canvas.getObjects().indexOf(activeObject);
                $scope.isolationMode.mode = true;

                //Not isolated objects ,add an attribute isolated = false
                var notIsolatedObjects = canvasObjects;
                for(var notIsolatedObject in notIsolatedObjects){
                    notIsolatedObjects[notIsolatedObject].isolated = false;
                    notIsolatedObjects[notIsolatedObject].selectable = false;
                }
                //End Not isolated objects

                var rect = new fabric.Rect({
                    left: 0,
                    top: 0,
                    fill: '#f1f1f1',
                    width: canvas.getWidth(),
                    height: canvas.getHeight(),
                    opacity:0.85,
                    hasBorders:false,
                    hasControls :false,
                    hasRotatingPoint :false,
                    lockMovementX :true,
                    lockMovementY :true,
                    lockRotation :true,
                    //selectable:false,
                    name: 'isolationRect'
                });
                canvas.add(rect);
                canvas.renderAll();
                activeObject.bringToFront();

                // ungrouping is here,and add isolated = true
                var items = activeObject._objects;
                activeObject._restoreObjectsState();
                canvas.remove(activeObject);
                for(var i = 0; i < items.length; i++) {
                    items[i].isolated = true;
                    canvas.add(items[i]);
                }
                canvas.renderAll();
                $scope.isolationMode.mode = true;
            }
        }
    }

/*
 * Switch on history
 */
    $rootScope.history = function(direction){
        if(direction.toLowerCase() == 'undo'){
            $scope.historyStep--;
            $rootScope.buttons.redo = false;
            if($scope.historyStep < 1){
                $rootScope.buttons.undo = true;
                $scope.historyStep = 0;
            }
        }
        //redo
        if(direction.toLowerCase() == 'redo'){
            $scope.historyStep++;
            $rootScope.buttons.undo = false;
            if($scope.historyStep >= $scope.histories.length-1){
                $rootScope.buttons.redo = true;
                $scope.historyStep = $scope.histories.length-1;
            }
        }
        //add Design
        var objects = $scope.histories[$scope.historyStep].objects;
        var canvas_size = $scope.histories[$scope.historyStep].canvas_size;
        
        $rootScope.addDesignsIntoCanvas($scope.histories[$scope.historyStep]);
        //end add design
    };

/*
 * Add text
 */
    $rootScope.addTextIntoCanvas = function(){
        $rootScope.showBlock = 'canvasText';
        var newTextObj = $scope.fabricAddText();
        $rootScope.canvasTextObj = newTextObj;
    };

/*
 * Add figures
 */
    $rootScope.addFigureIntoCanvas = function(figure){
        if(figure == 'circle'){
            var circle = new fabric.Circle({
                radius: 50, fill: 'green', left: 50, top: 100
            });
            canvas.add(circle).renderAll();
        }
        if(figure == 'rect'){
            var rect = new fabric.Rect({
                left: 150, top: 100, fill: 'red', width: 50, height: 50
            });
            canvas.add(rect).renderAll();
        }
    };

/*
 * Change text
 */
    $rootScope.changeTextIntoCanvas = function(obj){
        $rootScope.canvasTextObj = obj;
        canvas.renderAll();
    };

/*
 * Set styles for text
 */
    function setTextstyles (obj){
        var text = obj.textObj;
        //bold
        if(obj.style == 'bold'){
            if(text.fontWeight == 'bold')
                $rootScope.canvasTextObj.fontWeight = 'normal';
            else
                $rootScope.canvasTextObj.fontWeight = obj.style;
        }
        //italic
        if(obj.style == 'italic'){
            if(text.fontStyle == 'italic')
                $rootScope.canvasTextObj.fontStyle = '';
            else
                $rootScope.canvasTextObj.fontStyle = obj.style;
        }
        //underline
        if(obj.style == 'underline'){
            if(text.textDecoration == 'underline')
                $rootScope.canvasTextObj.textDecoration = 'none';
            else
                $rootScope.canvasTextObj.textDecoration = obj.style;
        }
        //line-through
        if(obj.style == 'line-through'){
            if(text.textDecoration == 'line-through')
                $rootScope.canvasTextObj.textDecoration = 'none';
            else
                $rootScope.canvasTextObj.textDecoration = obj.style;
        }
        
    };

/*
 * Transforming text
 * It works for IText objects
 */
    $rootScope.correctTextStyles = function(type){
        var text   = canvas.getActiveObject();
        if(text.type !='i-text') return false;
        switch (type){
            case 'textLeft'         : $rootScope.canvasTextObj.setTextAlign('left')      ;break;
            case 'textRight'        : $rootScope.canvasTextObj.setTextAlign('right')     ;break;
            case 'textCenter'       : $rootScope.canvasTextObj.setTextAlign('center')    ;break;
            case 'textBold'         : setTextstyles({textObj:text,style:'bold'})         ;break;
            case 'textItalic'       : setTextstyles({textObj:text,style:'italic'})       ;break;
            case 'textUnderline'    : setTextstyles({textObj:text,style:'underline'})    ;break;
            case 'textStrikethrough': setTextstyles({textObj:text,style:'line-through'}) ;break;
        }
        canvas.calcOffset();
        canvas.renderAll();
    };
    
/*
 * Object transformation
 */
$rootScope.objectTransform = function(type){
    var activeObject   = canvas.getActiveObject();
    var params = {
            widthC    : canvas.width/2,
            heightC   : canvas.height/2,
            widthO    : activeObject.getWidth()/2,
            heightO   : activeObject.getHeight()/2
    };

    //Active Object to Center
    if(type == 'center'){
        activeObject.left = params.widthC - params.widthO;
        activeObject.top  = params.heightC - params.heightO;
    }

    //Active object to  Horizonaly
    if(type == 'horizontally'){
        activeObject.top = params.heightC - params.heightO
    }

    //Active object to  Vertically
    if(type == 'vertically'){
        activeObject.left = params.widthC - params.widthO;
    }

    //Active object Bring To Front
    if(type == 'bring_to_front'){
        activeObject.bringToFront();
    }

    //Active object Send To End
    if(type == 'send_to_end'){
        activeObject.sendToBack();
    }

    //Active object Bring Forwards
    if(type == 'bring_forwards'){
        activeObject.bringForward(true);
    }

    //Active object Send Backwards
    if(type == 'send_backwards'){
        activeObject.sendBackwards(true);
    }

    //Active object Flip
    if(type == 'flip'){
        if(activeObject.flipX == true)
            activeObject.flipX = false;
        else
            activeObject.flipX = true;
    }

    //Active object Opacity
    if(type == 'opacity'){
        activeObject.opacity = $rootScope.canvasObjects.opacity;
    }
    //Active object Lock
    if(type == 'lock'){
            if(activeObject.lockMovementX == true){
                activeObject.lockMovementX    = false;
                activeObject.lockMovementY    = false;
                activeObject.lockRotation     = false;
                activeObject.lockScalingFlip  = false;
                activeObject.lockScalingX     = false;
                activeObject.lockScalingY     = false;
                activeObject.lockUniScaling   = false;
            }
            else{
                activeObject.lockMovementX    = true;
                activeObject.lockMovementY    = true;
                activeObject.lockRotation     = true;
                activeObject.lockScalingFlip  = true;
                activeObject.lockScalingX     = true;
                activeObject.lockScalingY     = true;
                activeObject.lockUniScaling   = true;
            }
    }
    activeObject.setCoords();
    canvas.renderAll();
};

/*
 * Add image into Canvas
 */
    $rootScope.addImageIntoCanvas = function(image){
        $rootScope.showBlock = 'canvasImage';
        if(image)
            $scope.fabricAddImageIntoCanvas(image);
    };

/*
 * Delete Image into canvas
 */
    $rootScope.deleteImage = function(image){
        $http.delete('designer/image/'+image).success(function(response) {
            $rootScope.images = response.images;
        });
    };

/*
 * Snap object to guideline
 * @returns {undefined}
 */
    function getActiveObjectCenterCoords ( event )
    {
        var object = event.target;
        var posX = (object.left+object.getWidth()) - (object.getWidth()/2);
        var posY = (object.top+object.getHeight()) - (object.getHeight()/2);
        return { x : posX , y : posY };
    }

/* 
 * Remove snap horizonal and vertical lines
 * @returns {undefined}
 */
function removeSnapLines(){
    canvas.remove(canvas.getItemsByName('vertical')[0]);
    canvas.remove(canvas.getItemsByName('horizonal')[0]);
    canvas.renderAll();    
}

/* 
 * Event fired on mouse up
 */
canvas.on('mouse:up', function(options){
    removeSnapLines();
});

/* 
 * Event fired on mouse moving
 */
canvas.on('object:moving', function(options){
    // snap to grid
    var grid = 10;

    var verticalX = canvas.getCenter().left;
    var verticalY = 0;

    var horizonalX = 0;
    var horizonalY = canvas.getCenter().top;
    var lineLength;
    if(canvas.getWidth() >= canvas.getHeight())
        lineLength = canvas.getWidth();
    else
        lineLength = canvas.getHeight();
    // create grid
    if(isEmpty(canvas.getItemsByName('vertical')))
        canvas.add(new fabric.Line([verticalX, verticalY, verticalX, lineLength],
        {
            selectable: false,
            name: 'vertical'
        }));

    if(isEmpty(canvas.getItemsByName('horizonal')))
        canvas.add(new fabric.Line([horizonalX, horizonalY, lineLength , horizonalY],
        {
            selectable: false,
            name: 'horizonal'
        }));
    if(getActiveObjectCenterCoords(options).x >= (verticalX - grid) && getActiveObjectCenterCoords(options).x <= verticalX + grid){
        var lineX = canvas.getItemsByName('vertical')[0]
        lineX.stroke='#000';
        options.target.set({
            left: verticalX - options.target.getWidth()/2
        });
    }else{
        canvas.remove(canvas.getItemsByName('vertical')[0]);
    }
    if(getActiveObjectCenterCoords(options).y >= horizonalY - grid && getActiveObjectCenterCoords(options).y <= horizonalY + grid){
        var lineY = canvas.getItemsByName('horizonal')[0]
        lineY.stroke='#000';
        options.target.set({
            top : horizonalY - options.target.getHeight()/2
        });
    }else{
        canvas.remove(canvas.getItemsByName('horizonal')[0]);
    }
});
/*
 * Event fired on mouse down
 */
canvas.on('mouse:down', function(e) {
    if( typeof e.target == 'undefined' && $scope.backGroundIsset ){
        $scope.backGroundSelected = true;
    }else{
        $scope.backGroundSelected = false;
    }
});

/*
 * Event fired when object selected
 */
//Checking group|ungroup button state here
var groupButtonName = 'Group';
var ungroupButtonName = 'Un Group';

//Event fired wen the object(s) or group(s) selected
canvas.on('object:selected', function(options) {
    if (options.target) {
        //Add And Change Text Into Canvas
        if(options.target.type == 'text' || options.target.type == 'i-text') {
                $rootScope.canvasTextObj = options.target;
                $rootScope.showBlock = 'canvasText';
        }
        if(options.target.type == 'image'){
            $scope.$apply(function() {
                $rootScope.showBlock = 'canvasImage';
            });
        }
        //After grouping objects or select the group
        if(options.target.type == 'group') {
            $rootScope.buttons.groupingToggleButtonStyle = {};
            if(isEmpty(options.target.originalState)){
                //Selected objects are combined into a group
                $scope.groupingToggleData.objects = canvas.getActiveGroup();
                $rootScope.groupingToggleData.state = true;
                if(!$scope.$$phase) {
                    $scope.$apply(function() {
                        $rootScope.groupingToggleData.buttonName = groupButtonName;
                    });
                }else{
                    $rootScope.groupingToggleData.buttonName = groupButtonName;
                }
            }else{
                //Select an existing group
                if(!$scope.$$phase){
                    $scope.$apply(function() {
                        $rootScope.showBlock = 'canvasGroup';
                    });
                }else{
                    $rootScope.showBlock = 'canvasGroup';
                }
                $scope.groupingToggleData.objects = canvas.getActiveObject();
                $rootScope.groupingToggleData.state = false;
                
                if(!$scope.$$phase) {
                    $scope.$apply(function() {
                        $rootScope.groupingToggleData.buttonName = ungroupButtonName;
                    });
                }else{
                    $rootScope.groupingToggleData.buttonName = ungroupButtonName;
                }
            }
        }else{
            resetGrouppingToggleData();
        }
    }
});

/*
 * Event fired When selection cleared
 */
canvas.on('selection:cleared', function(options) {
    if($scope.isolationMode.mode){
        $rootScope.buttons.isolationMode = false;
    }else{
        $rootScope.buttons.isolationMode = true;
    }
    resetGrouppingToggleData();
});
/*
 * Groupping toggle
 */
$rootScope.groupingToggle = function( state ){
    //grouping|ungrouping => true|false
    if(state){
        //grouping
        groupingObjects(canvas,$scope.groupingToggleData.objects);
        $scope.groupingToggleData.objects = canvas.getActiveGroup();
    }else{
        //ungrouping
        ungroupingObjects(canvas,$scope.groupingToggleData.objects);
        $scope.groupingToggleData.objects = canvas.getActiveObject();
    }
};
/*
 * add objects into group
 */
function groupingObjects(canvas,obj){
    obj.forEachObject(function(o){
        canvas.remove(o);
        canvas.discardActiveGroup().renderAll();
    });
    $rootScope.addObjectsIntoCanvas( 1 , JSON.stringify(obj._objects) , false);
};

/*
 * ungrouped objects if canvas.getActiveObject().type = group
 */
function ungroupingObjects(canvas,group){
    //ungrouping when isset canvas.getActiveObject()
    if(group == null && !$scope.groupingToggleData.state){
        // ungrouping is here,and add isolated = true
        var activeObject = canvas.getActiveObject();
        var items = activeObject._objects;
        activeObject._restoreObjectsState();
        canvas.remove(activeObject);
        for(var i = 0; i < items.length; i++) {
            canvas.add(items[i]);
        }
    }else{
        // ungrouping when isset canvas.getActiveGroup()
        var items = group._objects;
        group._restoreObjectsState();
        canvas.remove(group);
        for(var i = 0; i < items.length; i++) {
            canvas.add(items[i]);
        }
        canvas.discardActiveGroup();
    }
    canvas.renderAll();
};
/*
 * Reset Toggle datas
 */
function resetGrouppingToggleData(){
    if(!$scope.$$phase){
        $scope.$apply(function(){
            $rootScope.buttons.groupingToggleButtonStyle = {'display':'none'};
            $scope.groupingToggleData.objects = [];
            $rootScope.groupingToggleData.state = false;
        });
    }
    else{
        $rootScope.buttons.groupingToggleButtonStyle = {'display':'none'};
        $scope.groupingToggleData.objects = [];
        $rootScope.groupingToggleData.state = false;
    }
};
/*
 * Objects nudge (arrows)
 */
$scope.backGroundIsset    = false;
$rootScope.canvasbackGrounds.transforming = false;
document.onkeydown = function( evt ) {
    //Prevent default body scrolling after key press on arrow
    var keyCodes = [37, 38, 39, 40];
    if(keyCodes.indexOf(evt.keyCode)>=0){
        evt.preventDefault();
    }
    //init properties
    var active = canvas.getActiveObject();
    var step = 1;
    //move the selected object after pressing Arrow
    if(active){
        var left = active.left;
        var top = active.top;
        //left arrow
        if(evt.keyCode == 37)
            active.left = left - step;
        //right arrow
        if(evt.keyCode == 39)
            active.left = left + step;
        //up arrow
        if(evt.keyCode == 38)
            active.top = top - step;
        //down arrow
        if(evt.keyCode == 40)
            active.top = top + step;
    }
    canvas.renderAll();
}

/*
 * Add Background Into Canvas
 */
$rootScope.addBackgroundIntoCanvas = function( background , newBackground ){
    if($rootScope.canvasbackGrounds.transforming){
        switchObjectsSate( canvas , $scope.transformedImageName , 'on');
    }
    $scope.backGroundIsset = true;
    $rootScope.BackgroundFilePath = background.file;
    var img = new Image();
    img.crossOrigin = "anonymous";
    img.src = background.file;
    var center = canvas.getCenter();

    var     scaleX,
            scaleY,
            top     = center.top,
            left    = center.left,
            originX = 'center',
            originY = 'center'

    img.onload = function(){
        if(newBackground)
        {
            scaleX = canvas.getWidth()/img.width;
            scaleY = canvas.getHeight()/img.height;
            if( scaleX >= scaleY )
            {
                scaleY = scaleX;
            }
            else
            {
                scaleX = scaleY;
            }
        }else{
            scaleX  = background.position.scaleX;
            scaleY  = background.position.scaleY;
            top     = background.position.top;
            left    = background.position.left;
            originX = background.position.originX;
            originY = background.position.originY;
        }
        canvas.setBackgroundImage( new fabric.Image(img, {
            scaleX  : scaleX,
            scaleY  : scaleY,
            top     : top,
            left    : left,
            originX : originX,
            originY : originY,
            name    : 'transformedImage'
          }), canvas.renderAll.bind(canvas));
        canvas.discardActiveObject();
        canvas.renderAll();
        $rootScope.BackgroundFilePosition = {
            top     : top,
            left    : left,
            scaleX  : scaleX,
            scaleY  : scaleY,
            originX : originX,
            originY : originY
        };
    };
};

/*
 * Delete background Into Canvas
 */
$scope.deleteBackgroundById = function(id){
    $http.delete('designer/background/'+id).success(function(respoinse){
        console.log(response);
    });
};

/*
 * Delete Objects
*/
    $rootScope.deleteObjectIntoCanvas = function(){
        var active = canvas.getActiveObject();
        if(!active) return false;
        if(canvas.getActiveGroup()){
            canvas.getActiveGroup().forEachObject(function(o){ canvas.remove(o) });
            canvas.discardActiveGroup().renderAll();
          } else {
            canvas.remove(active);
          }
        $rootScope.showBlock = false;
        $rootScope.canvasbackGrounds.transforming = false;
        switchObjectsSate( canvas , active , 'on');
        if(isEmpty(canvas.getItemsByName(active.name))){
            $scope.backGroundIsset = false;
        }
    };

/*
 * Get objects,templates,designs by mode_id and backgrounds
 */
    $http.post('/designer/get-by-mode-id', {mode_id:$rootScope.mode.id}).
        success(function(data, status, headers, config) {
            $rootScope.canvasObjects = data.objects;
            $rootScope.canvasTemplates = data.templates;
            $rootScope.canvasBackgrounds = data.backgrounds;
            $rootScope.images = data.images;
        });

/*
 * Add Objects Into Canvas
 */
    $rootScope.addObjectsIntoCanvas = function( type , content , oldGroupId ){
        var objList = JSON.parse(content);
        var groups = [];
        fabric.util.enlivenObjects(objList, function(objects) {
            var origRenderOnAddRemove = canvas.renderOnAddRemove;
            canvas.renderOnAddRemove = false;
            objects.forEach(function(o) {
                groups.push(o);
            });
            var group = new fabric.Group(groups);
            canvas.add(group);
            //when toggle grouping objects oldGroupId = false
            if(!oldGroupId)
                canvas.setActiveObject(group);
            canvas.renderOnAddRemove = origRenderOnAddRemove;
            canvas.renderAll();
            //After exiting isolation mode return the original group layer order
            if(typeof  oldGroupId != 'undefined' || oldGroupId){
                var backWardsStepCount = canvas.getObjects().length-1 - oldGroupId;
                for( var i=0 ; i < backWardsStepCount ; i++){
                    group.sendBackwards();
                    canvas.renderAll();
                }
            }
        });
    };

/*
 * Add Templates Into Canvas
*/
    $rootScope.addTemplatesIntoCanvas = function( objects , canvas_size ){
        var myobjects = JSON.parse(objects);
        var canvas_size = JSON.parse(canvas_size);

        canvas.clear();
        canvas.setWidth(canvas_size.width);
        canvas.setHeight(canvas_size.height);
        
        fabric.util.enlivenObjects(myobjects, function(objects) {
            var origRenderOnAddRemove = canvas.renderOnAddRemove;
            canvas.renderOnAddRemove = false;
            objects.forEach(function(o) {
                canvas.add(o);
            });
            canvas.renderOnAddRemove = origRenderOnAddRemove;
            canvas.renderAll();
        });
    };
/*
==============================
    Add Designs Into Canvas
==============================
*/
    $rootScope.addDesignsIntoCanvas = function( object ){
        var canvas_background = JSON.parse(object.canvas_background);
        if( !isEmpty(canvas_background) ){
            $rootScope.addBackgroundIntoCanvas( canvas_background , false);
        }
        var myobjects = JSON.parse(object.objects);
        var canvas_size = JSON.parse(object.canvas_size);

        canvas.clear();
        canvas.setWidth(canvas_size.width);
        canvas.setHeight(canvas_size.height);

        fabric.util.enlivenObjects(myobjects, function(objects) {
            var origRenderOnAddRemove = canvas.renderOnAddRemove;
            canvas.renderOnAddRemove = false;
            objects.forEach(function(o) {
                canvas.add(o);
            });
            canvas.renderOnAddRemove = origRenderOnAddRemove;
            canvas.renderAll();
        });
    };
/*
 * Adding temp design if exists
 */
    if($rootScope.tempDesignSelected){
        $rootScope.addDesignsIntoCanvas( $rootScope.canvasTempDesigns,false );
    }

/*
 * Adding design if exists
 */
    if( $rootScope.designSelected ){
        $rootScope.addDesignsIntoCanvas( $rootScope.selectedDesign );
    }

/*
 * Zoom in canvas
 */
    $rootScope.zoomIn = function(zoom){
        var width = canvas.getWidth()*zoom;
        var scale = width / canvas.getWidth();
        var height = scale * canvas.getHeight();

        canvas.setDimensions({
            "width": width,
            "height": height
        });

        canvas.calcOffset();
        var objects = canvas.getObjects();
        for (var i in objects) {
            var scaleX = objects[i].scaleX;
            var scaleY = objects[i].scaleY;
            var left = objects[i].left;
            var top = objects[i].top;

            objects[i].scaleX = scaleX * scale;
            objects[i].scaleY = scaleY * scale;
            objects[i].left = left * scale;
            objects[i].top = top * scale;

            objects[i].setCoords();
        }

        canvas.renderAll();
    };

/*
 * Zoom out canvas
 */
    $rootScope.zoomOut = function(zoom){
        var width = canvas.getWidth()/zoom;
        var scale = width / canvas.getWidth();
        var height = scale * canvas.getHeight();

        canvas.setDimensions({
            "width": width,
            "height": height
        });

        canvas.calcOffset();
        var objects = canvas.getObjects();
        for (var i in objects) {
            var scaleX = objects[i].scaleX;
            var scaleY = objects[i].scaleY;
            var left = objects[i].left;
            var top = objects[i].top;

            objects[i].scaleX = scaleX * scale;
            objects[i].scaleY = scaleY * scale;
            objects[i].left = left * scale;
            objects[i].top = top * scale;

            objects[i].setCoords();
        }

        canvas.renderAll();
    };

// -------------------------------------------
// Save additional attributes in Serialization
// -------------------------------------------

    fabric.Object.prototype.toObject = (function (toObject) {
        return function () {
            return fabric.util.object.extend(toObject.call(this), {
                shadow: this.shadow,
                selectable: this.selectable,
                lockMovementX: this.lockMovementX,
                lockMovementY: this.lockMovementY,
                evented: this.evented,
                hasControls: this.hasControls,
                hasBorders: this.hasBorders,
                centeredScaling: this.centeredScaling,
                perPixelTargetFind: this.perPixelTargetFind,
                targetFindTolerance: this.targetFindTolerance,
                initialScale: this.initialScale,
                isolated: this.isolated,//Boolean,if object is in isolation mode
                name:this.name,
                path:this.path,
            });
        };
    })(fabric.Object.prototype.toObject);

// -------------------------------------------
// Get object by its custom attribute name
// return Array
// -------------------------------------------
    fabric.Canvas.prototype.getItemsByName = function(name) {
      var objectList = [],
          objects = this.getObjects();

      for (var i = 0, len = objects.length; i < len; i++) {
        if (objects[i].name && objects[i].name === name) {
          objectList.push(objects[i]);
        }
      }
      return objectList;
    };

//Check objects and arrays of emptiness
function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}
/*
 * Uploading background using FileUploader
 */
var backgroundUploader = $rootScope.backgroundUploader = new FileUploader({
        url: 'designer/upload-background'
    });

    // FILTERS

    backgroundUploader.filters.push({
        name: 'customFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            return this.queue.length < 10;
        }
    });
    backgroundUploader.onCompleteItem = function(fileItem,response) {
        $rootScope.canvasbackGrounds = response.backgrounds;
        console.log(response);
    };
    backgroundUploader.onAfterAddingFile = function(fileItem,response) {
        console.log('file selected');
    };
/*
 * Uploading image using FileUploader
 */
var imageUploader = $rootScope.imageUploader = new FileUploader({
        url : 'designer/upload-image'
    });

    // FILTERS

    imageUploader.filters.push({
        name: 'customFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            return this.queue.length < 10;
        }
    });
    imageUploader.onCompleteItem = function(fileItem,response) {
        $rootScope.images = response.images;
    };

    
   /*
    * Aviary
    */
    var featherEditor = new Aviary.Feather({
	apiKey: '9fa2ed68e8fc4cc7b0ec7d8c3ffaf65f',
	theme: 'dark', // Check out our new 'light' and 'dark' themes!
	tools: 'all',
	appendTo: '',
	onSave: function(imageID, newURL) {
		var img = document.getElementById(imageID);
		img.src = newURL;
                var arr = imageID.split('-');
                if(!arr.length){
                    alert('Something went wrong in Aviary onSave')
                    return false;
                }
                $http.post('designer/aviary-save',{
                    type:arr[0],
                    parent_id:arr[1],
                    file:newURL
                })
                    .success(function(response){
                        if(response.backgrounds && typeof response.backgrounds !='undefined')
                            $rootScope.canvasbackGrounds = response.backgrounds;
                        if(response.images && typeof response.images !='undefined')
                            $rootScope.images = response.images;
                    });
	},
	onError: function(errorObj) {
            alert(errorObj.message);
	}
    });
    $rootScope.launchEditor = function (id, src)
    {
        featherEditor.launch({
            image: id,
            url: src
        });
        return false;
    }
    /*End Aviary*/
}]);

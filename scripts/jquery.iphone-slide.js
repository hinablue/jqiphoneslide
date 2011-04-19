/**
 * iphoneSlide - jQuery plugin
 * @version: 0.51 (2011/03/14)
 * @requires jQuery v1.4+
 * @author Hina, Cain Chen. hinablue [at] gmail [dot] com
 * Examples and documentation at: http://jquery.hinablue.me/jqiphoneslide
 * 
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 **/

(function($) {

    var defaults = {
        handler: null,
        pageHandler : null,
        slideHandler : null,
        direction : 'horizontal',
        maxShiftPage : 5,
        nextPageHandler : '.nextPage',
        prevPageHandler : '.prevPage',
        draglaunch: 0.5,
        friction : 0.325,
        sensitivity : 20,
        extrashift : 800,
        touchduring : 800,
        easing: "swing",
        bounce: true,
        pageshowfilter : false,
        onShiftComplete : function() {}
    };

    $.fn.iphoneSlide = function(options, callback) {
        var workspace = $(this), opts = $.extend({}, defaults, options), callback = (typeof callback === "function") ? callback : function() { return false; };

        function __getMovingData(w, s, e, t) {
            var v = 0, ex = 0, w = w*1, s = s*1, e = e*1, t = t*1;

            v = (Math.abs(s - e) / Math.abs(t));
            ex = Math.floor(Math.pow((v/12), 2)*Math.abs(opts.extrashift) / (2*(9.80665/12)*Math.abs(opts.friction))*0.01);
            ex = (s>w/2) ? Math.floor(w/3) : s;

            return {"speed":v, "shift":ex};
        }

        function __initPages() {
            var totalPages, 
                handler = $(opts.handler, workspace), 
                pagesHandler = (!opts.pageshowfilter) ? handler.children(opts.pageHandler) : handler.children(opts.pageHandler).filter(':visible'), 
                matrixRow = matrixColumn = pagesOuterWidth = pagesOuterHeight = maxWidthPage = maxHeightPage = 0;

            totalPages = pagesHandler.length;

            maxWidthPage = workspace.width();
            maxHeightPage = workspace.height();

            switch(opts.direction) {
                case "matrix":
                    matrixRow = Math.ceil(Math.sqrt(totalPages));
                    matrixColumn = Math.ceil(totalPages / matrixRow);

                    pagesHandler.each(function(i, elem) { 
                        maxWidthPage = ($(elem).outerWidth(true) >= maxWidthPage) ? $(elem).outerWidth(true) : maxWidthPage;
                        maxHeightPage = ($(elem).outerHeight(true) >= maxHeightPage) ? $(elem).outerHeight(true) : maxHeightPage;
                    });
                    pagesOuterWidth = maxWidthPage * matrixRow;
                    pagesOuterHeight = maxHeightPage * matrixColumn;

                    handler.width(pagesOuterWidth).height(pagesOuterHeight);

                    pagesHandler.each(function(i, elem) {
                        if ($(elem).outerWidth() < maxWidthPage) {
                            $(elem).css({
                                'margin-left': (maxWidthPage - $(elem).outerWidth())/2,
                                'margin-right': (maxWidthPage - $(elem).outerWidth())/2
                            });
                        }
                        if ($(elem).outerHeight() < maxHeightPage) {
                            $(elem).css({
                                'margin-top': (maxHeightPage - $(elem).outerHeight())/2,
                                'margin-bottom': (maxHeightPage - $(elem).outerHeight())/2
                            });
                        }
                    });
                    for(var i=matrixColumn; i>1; i--) {
                        $('<br class="matrix-break-point" style="clear:both;" />').insertAfter(pagesHandler.eq((i-1)*matrixRow-1));
                    }
                break;
                case "vertical":
                    pagesHandler.each(function(i, elem) { 
                        pagesOuterHeight += $(elem).outerHeight(true);
                        maxWidthPage = ($(elem).outerWidth(true) >= maxWidthPage) ? $(elem).outerWidth(true) : maxWidthPage;
                        maxHeightPage = ($(elem).outerHeight(true) >= maxHeightPage) ? $(elem).outerHeight(true) : maxHeightPage;
                    });
                    pagesHandler.each(function(i, elem) {
                        if ($(elem).outerWidth() < maxWidthPage) {
                            $(elem).css('margin-left', (maxWidthPage - $(elem).outerWidth())/2);
                        }
                    });
                    pagesOuterWidth = maxWidthPage;
                    handler.height(pagesOuterHeight).width(pagesOuterWidth).css('top', (maxHeightPage - pagesHandler.eq(0).outerHeight(true))/2);
                break;
                case "horizontal":
                default:
                    pagesHandler.each(function(i, elem) { 
                        pagesOuterWidth += $(elem).outerWidth(true);
                        maxWidthPage = ($(elem).outerWidth(true) >= maxWidthPage) ? $(elem).outerWidth(true) : maxWidthPage;
                        maxHeightPage = ($(elem).outerHeight(true) >= maxHeightPage) ? $(elem).outerHeight(true) : maxHeightPage;
                    });
                    pagesHandler.each(function(i, elem) {
                        if ($(elem).outerHeight() < maxHeightPage) {
                            $(elem).css('margin-top', (maxHeightPage - $(elem).outerHeight())/2);
                        }
                    });
                    pagesOuterHeight = maxHeightPage;
                    handler.width(pagesOuterWidth).height(pagesOuterHeight).css('left', (maxWidthPage - pagesHandler.eq(0).outerWidth(true))/2);
            }

            pagesHandler.css({ 'display' : 'block' });

            workspace.width(maxWidthPage).height(maxHeightPage)
                .data("workData", $.extend({}, 
                 {
                    'totalPages': totalPages,
                    'matrixRow': matrixRow,
                    'matrixColumn': matrixColumn,
                    'pagesOuterWidth': pagesOuterWidth,
                    'pagesOuterHeight': pagesOuterHeight,
                    'nowPage': 1,
                    'initIphoneSlide': true
                 })
            );

            if($.isFunction(callback)) callback.call(workspace);
        }

        function __onSlideCallback() {
            var workData = workspace.data("workData"), nowPage = workData.nowPage;

            if(opts.pageshowfilter) {
                opts.onShiftComplete.call(workspace, $(opts.handler, workspace).children(opts.pageHandler).filter(':visible').eq(nowPage-1), nowPage);
            } else {
                opts.onShiftComplete.call(workspace, $(opts.handler, workspace).children(opts.pageHandler).eq(nowPage-1), nowPage);
            }
        }

        function __slidingToPage(page, easing) {
            var page = page, 
                easing = easing || { "X":0, "Y": 0},
                handler = $(opts.handler, workspace), 
                pageElem = (opts.pageshowfilter ? handler.children(opts.pageHandler).filter('visible') : handler.children(opts.pageHandler)), 
                shift = { "X": 0, "Y": 0 }, 
                __animate = { 'before': {}, 'after': {} },
                outerWidthBoundary = workspace.width(),
                outerHeightBoundary = workspace.height(),
                nowPageElem = pageElem.eq(page-1);

            switch(opts.direction) {
                case "matrix":
                    shift.X = nowPageElem.position().left;
                    shift.X -= (outerWidthBoundary - nowPageElem.outerWidth(true))/2;
                    shift.Y = nowPageElem.position().top;
                    shift.Y -= (outerHeightBoundary - nowPageElem.outerHeight(true))/2;
                    __animate = {
                        'before': { 'top': -1*shift.Y+easing.Y, 'left': -1*shift.X+easing.X },
                        'after': { 'top': -1*shift.Y, 'left': -1*shift.X }
                    };
                break;
                case "vertical":
                    shift.Y = nowPageElem.position().top;
                    shift.Y -= (outerHeightBoundary - nowPageElem.outerHeight(true))/2;
                    __animate = {
                        'before': { 'top': -1*shift.Y+easing.Y },
                        'after': { 'top': -1*shift.Y }
                    };
                break;
                case "horizontal":
                default:
                    shift.X = nowPageElem.position().left;
                    shift.X -= (outerWidthBoundary - nowPageElem.outerWidth(true))/2;
                    __animate = {
                        'before': { 'left': -1*shift.X+easing.X },
                        'after': { 'left': -1*shift.X }
                    };
            }

            return __animate;
        }

        return this.each(function() {
            var workspace = $(this), workData = workspace.data("workData"), 
                handler = $(opts.handler, workspace), 
                dragAndDrop = $.extend({}, { origX:0, origY:0, X:0, Y:0 }), 
                startEventData, moveEventData, 
                totalPages = matrixRow = matrixColumn = 0,
                nowPage = 1,
                __preventClickEvent = __mouseStarted = __touchesDevice = false,
                pageElem = $(opts.handler, workspace).children(opts.pageHandler);

            if (opts.pageshowfilter) {
                pageElem = pageElem.filter(':visible');
            }

            if (workspace.children().length>1) {
                alert('The Selector('+workspace.attr('id')+')\'s page handler can not more than one element.');
                return this;
            }

            if (opts.handler === null || typeof opts.handler !== "string") {
                opts.handler = ".iphone-slide-page-handler";
                workspace.children(':first').addClass('iphone-slide-page-handler');
            }

            if ($(opts.handler, workspace).children().length==0) {
                alert('You have no page(s) context.');
                return this;
            }

            if (opts.pageHandler === null || typeof opts.pageHandler !== "string") {
                switch(handler.attr('tagName').toLowerCase()) {
                    case "ul":
                    case "ol":
                        opts.pageHandler = 'li';
                    break;
                    default:
                        opts.pageHandler = handler.children(':first').attr('tagName').toLowerCase();
                }
            }

            var __slideNextPage = function(event) {
                var nowPage = parseInt(workData.nowPage), 
                    totalPages = parseInt(workData.totalPages);

                nowPage++;
                if (nowPage <= totalPages) {
                    __mouseStarted = true;
                    var __animate = __slidingToPage(nowPage);
                    handler.animate(__animate.after, 300, function() {
                        __mouseStarted = false;
                        __onSlideCallback(workspace);
                    });
                } else {
                    nowPage = totalPages;
                }               
                workspace.data("nowPage", $.extend({}, workData, { "nowPage": nowPage }));

                return true;
            };

            var __slidePrevPage = function(event) {
                var nowPage = parseInt(workData.nowPage), 
                    totalPages = parseInt(workData.totalPages);

                nowPage--;
                if(nowPage>0) {
                    __mouseStarted = true;
                    var __animate = __slidingToPage(nowPage);
                    handler.animate(__animate.after, 300, function() {
                        __mouseStarted = false;
                        __onSlideCallback(workspace);
                    });
                } else {
                    nowPage = 1;
                }
                workspace.data("nowPage", $.extend({}, workData, { "nowPage": nowPage }));

                return true;
            };

            var __mouseDown = function(event) {
                if (__mouseStarted) return false;

                event.preventDefault();

                __mouseStarted = true;

                var __touches = event.originalEvent.touches || event.originalEvent.targetTouches || event.originalEvent.changedTouches,
                    __startEvent =  __touches === undefined ? event : __touches[0];

                startEventData = $.extend({}, __startEvent, { timeStamp: event.timeStamp });

                if (__touches !== undefined) __touchesDevice = true;

                dragAndDrop.origX = $(this).position().left;
                dragAndDrop.origY = $(this).position().top;

                if (opts.slideHandler === null || typeof opts.slideHandler !== "string") {
                    handler.bind("mousemove touchmove", __mouseMove, false).bind("mouseleave mouseup touchend touchcancel", __mouseUp, false);
                } else {
                    handler.filter(opts.slideHandler).bind("mousemove touchmove", __mouseMove, false).bind("mouseleave mouseup touchend touchcancel", __mouseUp, false);
                }
            };
            
            var __mouseMove = function(event) {
                if ($.browser.msie && !event.button) return __mouseUp(event);

                if (__mouseStarted) {
                    event.preventDefault();

                    var __touches = event.originalEvent.touches || event.originalEvent.targetTouches || event.originalEvent.changedTouches,
                        __eventTouches =  __touches === undefined ? event : __touches[0],
                        __mouseDownEvent = startEventData;

                    moveEventData = $.extend({}, __eventTouches, { timeStamp: event.timeStamp });

                    switch(opts.direction) {
                        case "matrix":
                            dragAndDrop.X = parseInt(__eventTouches.pageX - __mouseDownEvent.pageX);
                            dragAndDrop.Y = parseInt(__eventTouches.pageY - __mouseDownEvent.pageY);
                            handler.css({
                                top: (dragAndDrop.origY + dragAndDrop.Y) + "px",
                                left: (dragAndDrop.origX + dragAndDrop.X) + "px"
                            });
                        break;
                        case "vertical":
                            dragAndDrop.Y = parseInt(__eventTouches.pageY - __mouseDownEvent.pageY);
                            handler.css({
                                top: (dragAndDrop.origY + dragAndDrop.Y) + "px"
                            });
                        break;
                        case "horizontal":
                        default:
                            dragAndDrop.X = parseInt(__eventTouches.pageX - __mouseDownEvent.pageX);
                            handler.css({
                                left: (dragAndDrop.origX + dragAndDrop.X) + "px"
                            });
                    }
                }

                return !__mouseStarted;
            };

            var __mouseUp = function(event) {

                event.preventDefault();

                if (opts.slideHandler === null || typeof opts.slideHandler !== "string") {
                    handler.unbind("mousemove touchmove", __mouseMove, false);
                } else {
                    handler.filter(opts.slideHandler).unbind("mousemove touchmove", __mouseMove, false);
                }

                var workData = $(this).parent().data("workData"),
                    totalPages = parseInt(workData.totalPages), 
                    nowPage = parseInt(workData.nowPage), 
                    matrixRow = parseInt(workData.matrixRow), 
                    matrixColumn = parseInt(workData.matrixColumn), 
                    __eventTouches,
                    __touches = event.originalEvent.touches || event.originalEvent.targetTouches || event.originalEvent.changedTouches,
                    __mouseDownEvent = startEventData;

                if (__touches === undefined) {
                    __eventTouches = __touchesDevice ? moveEventData : event;
                } else {
                    __eventTouches = __touches[0] === undefined ? moveEventData : __touches[0];
                }

                if (__mouseStarted) __preventClickEvent = (event.target == __mouseDownEvent.target);

                if (Math.max(
                    Math.abs(__mouseDownEvent.pageX - __eventTouches.pageX),
                    Math.abs(__mouseDownEvent.pageY - __eventTouches.pageY)
                   ) >= parseInt(opts.sensitivity)
                ) {
                    var timeStamp = Math.abs(moveEventData.timeStamp - startEventData.timeStamp);
                    var thisPage = pageElem.eq(nowPage -1),
                        thisPageSize = {
                            "width": thisPage.outerWidth(true),
                            "height": thisPage.outerHeight(true)
                        },
                        thisMove = {
                            "X": __getMovingData(thisPageSize.width, __mouseDownEvent.pageX, __eventTouches.pageX, timeStamp),
                            "Y": __getMovingData(thisPageSize.height, __mouseDownEvent.pageY, __eventTouches.pageY, timeStamp)
                        },
                        shift = {
                            "X": 0,
                            "Y": 0,
                            "shift": Math.max(thisMove.X.shift , thisMove.Y.shift),
                            "speed": Math.max(thisMove.X.speed , thisMove.Y.speed)
                        }, 
                        easing = {
                            "X": Math.min(__eventTouches.pageX-__mouseDownEvent.pageX , thisPageSize.width),
                            "Y": Math.min(__eventTouches.pageY-__mouseDownEvent.pageY , thisPageSize.height)
                        },
                        pages = {
                            "X": (Math.abs(dragAndDrop.X) >= thisPageSize.width*opts.draglaunch || Math.abs(dragAndDrop.Y) >= thisPageSize.height*opts.draglaunch) ? 0 : (timeStamp>opts.touchduring) ? 1 : Math.ceil(thisMove.X.speed*thisMove.X.shift/thisPageSize.width),
                            "Y": (Math.abs(dragAndDrop.X) >= thisPageSize.width*opts.draglaunch || Math.abs(dragAndDrop.Y) >= thisPageSize.height*opts.draglaunch) ? 0 : (timeStamp>opts.touchduring) ? 1 : Math.ceil(thisMove.Y.speed*thisMove.Y.shift/thisPageSize.height)
                        };

                    during = Math.min(300, opts.touchduring , Math.max(1/shift.speed*Math.abs(opts.extrashift), Math.abs(opts.extrashift)*0.5));

                    switch(opts.direction) {
                        case "matrix":
                            var pageColumn = Math.ceil(nowPage/matrixRow);
                            pages.X = (pages.X>matrixRow) ? matrixRow : ((Math.abs(dragAndDrop.X) >= thisPageSize.width*opts.draglaunch) ? 1 : ((Math.floor(Math.abs(easing.Y/easing.X))>2) ? 0 : pages.X));
                            pages.X = (easing.X > 0) ? (Math.min(pages.X, (nowPage-matrixRow*(pageColumn-1)-1))) : (Math.min(pages.X, (matrixRow*pageColumn-nowPage)));

                            pages.Y = (pages.Y>matrixColumn) ? matrixColumn : ((Math.abs(dragAndDrop.Y) >= thisPageSize.height*opts.draglaunch) ? 1 : ((Math.floor(Math.abs(easing.X/easing.Y))>2) ? 0 : pages.Y));
                            pages.Y = (easing.Y > 0) ? (Math.min(pages.Y, (pageColumn-1))) : (((matrixRow*pages.Y+nowPage)>totalPages) ? (matrixColumn-pageColumn) : pages.Y);

                            nowPage = (easing.X > 0) ? (((nowPage-pages.X)<1) ? 1 : nowPage-pages.X) : ((nowPage+pages.X>totalPages) ? totalPages : nowPage+pages.X);
                            nowPage = (easing.Y > 0) ? (((nowPage-pages.Y*matrixRow)<1) ? 1 : nowPage-pages.Y*matrixRow) : ((pages.Y*matrixRow>totalPages) ? totalPages : nowPage+pages.Y*matrixRow);
                        break;
                        case "vertical":
                            pages.X = 0;
                            pages.Y = (pages.Y==0) ? 1 : ((pages.Y>opts.maxShiftPage) ? opts.maxShiftPage : pages.Y);
                            pages.Y = (easing.Y>0) ? (((nowPage-pages.Y)<1) ? nowPage-1 : pages.Y) : (((nowPage + pages.Y)>totalPages) ? totalPages - nowPage : pages.Y);
                            nowPage = (easing.Y>0) ? (((nowPage-pages.Y)<1) ? 1 : nowPage-pages.Y) : (((nowPage + pages.Y)>totalPages) ? totalPages : nowPage+pages.Y);
                        break;
                        case "horizontal":
                        default:
                            pages.Y = 0;
                            pages.X = (pages.X==0) ? 1 : ((pages.X>opts.maxShiftPage) ? opts.maxShiftPage : pages.X);
                            pages.X = (easing.X > 0) ? (((nowPage-pages.X)<1) ? nowPage-1 : pages.X) : (((nowPage + pages.X)>totalPages) ? totalPages - nowPage : pages.X);
                            nowPage = (easing.X > 0) ? (((nowPage-pages.X)<1) ? 1 : nowPage-pages.X) : (((nowPage + pages.X)>totalPages) ? totalPages : nowPage+pages.X);
                    }

                    var __animate = (opts.bounce === true) ? __slidingToPage(nowPage, easing) : __slidingToPage(nowPage, 0);

                    if (opts.bounce === true) $(this).animate(__animate.before, during);
                    $(this).animate(__animate.after, during, ($.easing[opts.easing]!==undefined ? opts.easing : "swing"), function() {
                        __mouseStarted = false;
                        __onSlideCallback();
                    });
                } else {
                    $(this).animate({ 'top': dragAndDrop.origY, 'left': dragAndDrop.origX }, 50, function() {
                        __mouseStarted = false;
                    });
                }

                if (opts.slideHandler === null || typeof opts.slideHandler !== "string") {
                    $(this).unbind("mouseleave mouseup touchend", __mouseUp, false);
                } else {
                    $(this).filter(opts.slideHandler).unbind("mouseleave mouseup touchend", __mouseUp, false);
                }

                workspace.data("workData", $.extend({}, workData, { "nowPage": nowPage }));

                return !__mouseStarted;
            };

            if(opts.slideHandler === null || typeof opts.slideHandler !== "string") {
                handler
                    .bind("mousedown touchstart", __mouseDown, false)
                    .bind("click", function(event) {
                        if(__preventClickEvent) {
                            __preventClickEvent = false;
                            event.stopImmediatePropagation();
                            return false;
                        }
                    }, false);
            } else {
                handler.filter(opts.slideHandler)
                    .bind("mousedown touchstart", __mouseDown, false)
                    .bind("click", function(event) {
                        if(__preventClickEvent) {
                            __preventClickEvent = false;
                            event.stopImmediatePropagation();
                            return false;
                        }
                    }, false);
            }

            __initPages();

            return this;
        });
    }

    $.fn.slidingToPage = function(page) {
        var workData = $(this).data("workData");
        if (workData.initIphoneSlide) {

        } else {
            alert ('Your target is not iPhone-Slide workspace.');
            return false;
        }
    };
})(jQuery);

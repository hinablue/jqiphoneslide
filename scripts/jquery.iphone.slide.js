/**
 * iphoneSlide - jQuery plugin
 * @version: 0.32 (2010/04/07)
 * @requires jQuery v1.3.2 or later 
 * @author Hina, Cain Chen. hinablue [at] gmail [dot] com
 * Examples and documentation at: http://jquery.hinablue.me/jqiphoneslide
 
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
**/
(function($) {
	var defaults = {
		handler: undefined,
		pageHandler : undefined,
		slideHandler : undefined,
		nextPageHandler : '.nextPage',
		prevPageHandler : '.prevPage',
		friction : 0.325,
		sensitivity : 20,
		extrashift : 800,
		touchduring : 800,
		direction : 'horizontal',
		maxShiftPage : 5,
		easing: "swing",
		pageshowfilter : false,
		onShiftComplete : function() {}
	};

	$.fn.iphoneSlide = function(options, callback) {
		var opts = $.extend({}, defaults, options), callback = callback;
		
		function __getMovingData(w, s, e, t) {
			var v = 0, s = 0;
			
			v = (Math.abs(s - e) / Math.abs(t)).toPrecision(5);
			s = Math.floor(Math.pow(v, 2)*Math.abs(opts.extrashift) / (2*0.0098*Math.abs(opts.friction)));
			s = (s>w/2) ? Math.floor(w/3) : s;
			
			return {"speed":v, "shift":s};
		}
		
		function __initPages(w) {
			var totalPages, workspace = w, handler = $(opts.handler, workspace), pagesHandler = (!opts.pageshowfilter) ? handler.children(opts.pageHandler) : handler.children(opts.pageHandler).filter(':visible'), matrixSqrt = 0, matrixColumn = 0;
			
			totalPages = pagesHandler.length;
			
			switch(opts.direction) {
				case "matrix":
					matrixSqrt = Math.ceil(Math.sqrt(totalPages));
					matrixColumn = Math.ceil(totalPages / matrixSqrt);
					
					if(matrixColumn*matrixSqrt > totalPages) {
						var firstChild = pagesHandler.filter(":first"), lastChild = pagesHandler.filter(":last");
						for(var i=0; i<(matrixColumn*matrixSqrt - totalPages); i++) {
							firstChild.clone().empty()
							.removeAttr('id').removeAttr('style')
							.addClass("matrix-blank-page").css('display','block')
							.insertAfter(lastChild);
						}
						totalPages = matrixColumn*matrixSqrt;
					}					
					for(var i=matrixColumn; i>1; i--) {
						$('<br class="matrix-break-point" style="clear:both;" />').insertAfter(pagesHandler.eq((i-1)*matrixSqrt-1));
					}
					handler.width(matrixSqrt*workspace.width()).height(matrixColumn*workspace.height());
				break;
				case "vertical":
					handler.height(totalPages*workspace.height());
				break;
				case "horizontal":
				default:
					handler.width(totalPages*workspace.width());
			}
			
			pagesHandler.css({ 'display' : 'block' });
			
			workspace.data("totalPages", totalPages)
			.data("matrixSqrt", matrixSqrt)
			.data("matrixColumn", matrixColumn)
			.data("nowPage", 1)
			.data("initIphoneSlide", true);
			
			if($.isFunction(callback)) callback.call(workspace);
		}
		
		function __onSlideCallback(w) {
			var workspace = w, nowPage = workspace.data("nowPage");
		
			if(opts.pageshowfilter) {
				opts.onShiftComplete.call(workspace, $(opts.handler, workspace).children(opts.pageHandler).filter(':visible').eq(nowPage-1), nowPage);
			} else {
				opts.onShiftComplete.call(workspace, $(opts.handler, workspace).children(opts.pageHandler).eq(nowPage-1), nowPage);
			}
			return false;
		}
		
		function __slidingPage(h, d, m) {
			var workspace = h.parent(), handler = h, direction = d, matrix = m, matrixSqrt = workspace.data("matrixSqrt"), left = ((direction) ? "-=" : "+="), top = ((direction) ? "-=" : "+="), _width = workspace.width(), _height = workspace.height();
			
			switch(opts.direction) {
				case "matrix":
					if(matrix) {
						left = (direction) ? "+=" : "-=";						
						handler.animate({ 'left': left+((matrixSqrt-1)*_width)+"px", 'top': top+_height+"px" }, function() { __onSlideCallback(workspace); });
					} else {
						handler.animate({ 'left': left+_width+"px" }, function() { __onSlideCallback(workspace); });
					}
				break;
				case "vertical":
					handler.animate({ 'top': top+_height+"px" }, function() { __onSlideCallback(workspace); });
				break;
				case "horizontal":
				default:
					handler.animate({ 'left': left+_width+"px" }, function() { __onSlideCallback(workspace); });
			}
		}
		
		return this.each(function() {
			var workspace = $(this), handler = $(opts.handler, workspace), totalPages = 0, nowPage = 1, matrixSqrt = 0, matrixColumn = 0;
			
			if(workspace.children().length>1) {
				alert('The Selector('+workspace.attr('id')+')\'s page handler can not more than one element.');
				return this;
			}
		
			if(opts.handler==undefined || typeof opts.handler !== "string") {
				opts.handler = ".iphone-slide-page-handler";
				workspace.children(':first').addClass('iphone-slide-page-handler');
			}
			
			if($(opts.handler, workspace).children().length==0) {
				alert('You have no page(s) context.');
				return this;
			}
			
			if(opts.pageHandler==undefined || typeof opts.pageHandler !== "string") {
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
				var nowPage = workspace.data("nowPage"), totalPages = workspace.data("totalPages"), matrixSqrt = workspace.data("matrixSqrt");				
				nowPage++;
				if(nowPage<=totalPages) {
					if(opts.direction=="matrix" && ((nowPage-1) % matrixSqrt == 0)) {
						__slidingPage(handler, true, true);
					} else {
						__slidingPage(handler, true, false);
					}
				} else {
					nowPage = totalPages;
				}				
				workspace.data("nowPage", nowPage);
				return false;
			};
			
			var __slidePrevPage = function(event) {
				var nowPage = workspace.data("nowPage"), totalPages = workspace.data("totalPages"), matrixSqrt = workspace.data("matrixSqrt");				
				nowPage--;
				if(nowPage>0) {
					if(opts.direction=="matrix" && (nowPage % matrixSqrt == 0)) {
						__slidingPage(handler, false, true);
					} else {
						__slidingPage(handler, false, false);
					}
				} else {
					nowPage = 1;
				}				
				workspace.data("nowPage", nowPage);
				return false;
			};
			
			var __preventClickEvent = false, __mouseStarted = false, __mouseTarget, __mouseDownEvent;
			
			var __mouseDown = function(event) {
				if(__mouseStarted) return false;
				
				event.originalEvent = event.originalEvent || {};
				if (event.originalEvent.mouseHandled) { return; }
				
				(__mouseStarted && __mouseUp(event));
				
				__mouseDownEvent = event;
				__mouseTarget = $(event.target);
				
				event.preventDefault();
				
				workspace.bind('mousemove', __mouseMove).bind('mouseleave mouseup', __mouseUp);
				
				event.originalEvent.mouseHandled = true;
			};
			
			var __mouseMove = function(event) {
				if ($.browser.msie && !event.button) return __mouseUp(event);
				if(__mouseStarted) return event.preventDefault();
				
				return !__mouseStarted;
			};
			
			var __mouseUp = function(event) {
				var totalPages = workspace.data("totalPages"), nowPage = workspace.data("nowPage"), matrixSqrt = workspace.data("matrixSqrt"), matrixColumn = workspace.data("matrixColumn");
			
				workspace.unbind('mousemove', __mouseMove).unbind('mouseleave mouseup', __mouseUp);
				
				if (__mouseStarted) __preventClickEvent = (event.target == __mouseDownEvent.target);
				
				if(__mouseDistanceMet(event)) {
					var during, _width = workspace.width(), _height = workspace.height(), timeStamp = Math.abs(__mouseDownEvent.timeStamp - event.timeStamp);

					var thisMove = {
						"X": __getMovingData(_width, __mouseDownEvent.pageX, event.pageX, timeStamp),
						"Y": __getMovingData(_height, __mouseDownEvent.pageY, event.pageY, timeStamp),
					}, pages = {
						"X": (timeStamp>opts.touchduring) ? 1 : Math.ceil(thisMove.X.speed*thisMove.X.shift/_width),
						"Y": (timeStamp>opts.touchduring) ? 1 : Math.ceil(thisMove.Y.speed*thisMove.Y.shift/_height)
					}, easing = {
						"X": Math.min(event.pageX-__mouseDownEvent.pageX , opts.maxShiftPage),
						"Y": Math.min(event.pageY-__mouseDownEvent.pageY , opts.maxShiftPage)
					}, shift = {
						"X": "",
						"Y": "",
						"EX": "",
						"EY": "",
						"shift": Math.max(thisMove.X.shift , thisMove.Y.shift),
						"speed": Math.max(thisMove.X.speed , thisMove.Y.speed)
					};
					
					during = Math.max(1/shift.speed*Math.abs(opts.extrashift), Math.abs(opts.extrashift)*0.5);

					switch(opts.direction) {
						case "matrix":
							var pageColumn = Math.ceil(nowPage/matrixSqrt);
							
							pages.X = (pages.X>matrixSqrt) ? matrixSqrt : (Math.floor(Math.abs(easing.Y/easing.X))>2) ? 0 : pages.X;
							pages.Y = (pages.Y>matrixColumn) ? matrixColumn : (Math.floor(Math.abs(easing.X/easing.Y))>2) ? 0 : pages.Y;
							
							if(easing.X>0) {
								pages.X = Math.min(pages.X, (nowPage-matrixSqrt*(pageColumn-1)-1));
								nowPage = ((nowPage-pages.X)<1) ? 1 : nowPage-pages.X;
								shift.X = "+=";
								shift.EX = "-=";
							} else {
								pages.X = Math.min(pages.X, (matrixSqrt*pageColumn-nowPage));
								nowPage = (nowPage+pages.X>totalPages) ? totalPages : nowPage+pages.X;
								shift.X = "-=";
								shift.EX = "+=";
							}
							shift.X += ((pages.X*_width+shift.shift).toString())+"px";
							shift.EX += (shift.shift.toString())+"px";
							
							if(easing.Y>0) {
								pages.Y = Math.min(pages.Y, (pageColumn-1));
								nowPage = ((nowPage-pages.Y*matrixSqrt)<1) ? 1 : nowPage-pages.Y*matrixSqrt;
								shift.Y = "+=";
								shift.EY = "-=";
							} else {
								pages.Y = ((matrixSqrt*pages.Y+nowPage)>totalPages) ? (matrixColumn-pageColumn) : pages.Y;
								nowPage = (pages.Y*matrixSqrt>totalPages) ? totalPages : nowPage+pages.Y*matrixSqrt;
								shift.Y = "-=";
								shift.EY = "+=";
							}
							shift.Y += ((pages.Y*_height+shift.shift).toString())+"px";
							shift.EY += (shift.shift.toString())+"px";
						break;
						case "vertical":
							pages.X = 0;
							pages.Y = (pages.Y==0) ? 1 : ((pages.Y>opts.maxShiftPage) ? opts.maxShiftPage : pages.Y);
							if(easing.Y>0) {
								pages.Y = ((nowPage-pages.Y)<1) ? nowPage-1 : pages.Y;
								nowPage = ((nowPage-pages.Y)<1) ? 1 : nowPage-pages.Y;
								shift.Y = "+=";
								shift.EY = "-=";
							} else {
								pages.Y = ((nowPage + pages.Y)>totalPages) ? totalPages - nowPage : pages.Y;
								nowPage = ((nowPage + pages.Y)>totalPages) ? totalPages : nowPage+pages.Y;
								shift.Y = "-=";
								shift.EY = "+=";
							}
							shift.X = "+=0px";
							shift.Y += ((pages.Y*_height+shift.shift).toString())+"px";
							shift.EY += (shift.shift.toString())+"px";
							shift.EX = "+=0px";
						break;
						case "horizontal":
						default:
							pages.Y = 0;
							pages.X = (pages.X==0) ? 1 : ((pages.X>opts.maxShiftPage) ? opts.maxShiftPage : pages.X);
							if(easing.X>0) {
								pages.X = ((nowPage-pages.X)<1) ? nowPage-1 : pages.X;
								nowPage = ((nowPage-pages.X)<1) ? 1 : nowPage-pages.X;
								shift.X = "+=";
								shift.EX = "-=";
							} else {
								pages.X = ((nowPage + pages.X)>totalPages) ? totalPages - nowPage : pages.X;
								nowPage = ((nowPage + pages.X)>totalPages) ? totalPages : nowPage+pages.X;
								shift.X = "-=";
								shift.EX = "+=";
							}
							shift.X += ((pages.X*_width+shift.shift).toString())+"px";
							shift.Y = "+=0px";
							shift.EX += (shift.shift.toString())+"px";
							shift.EY = "+=0px"; 
					}
					
					var slideEasing = ($.easing[opts.easing]!==undefined) ? opts.easing : "swing";
					
					handler.animate({ 'top': shift.Y, 'left': shift.X }, during)
					.animate(
					{ 'top': shift.EY, 'left': shift.EX },
					{ duration: during, 
						easing: slideEasing, 
						complete: function() {
							__mouseStarted = false;
							__onSlideCallback(workspace);
						}
					});
				}
				workspace.data("nowPage", nowPage);
				return false;
			};
			
			var __mouseDistanceMet = function(event) {
				return (Math.max(
						Math.abs(__mouseDownEvent.pageX - event.pageX),
						Math.abs(__mouseDownEvent.pageY - event.pageY)
						) >= parseInt(opts.sensitivity)
				);
			};

			if(opts.slideHandler==undefined || typeof opts.slideHandler !== "string") {
				workspace
				.bind("mousedown", __mouseDown)
				.bind("click", function(event) {
					if(__preventClickEvent) {
						__preventClickEvent = false;
						event.stopImmediatePropagation();
						return false;
					}
				});
			} else {
				handler.filter(opts.slideHandler)
				.bind("mousedown", __mouseDown)
				.bind("click", function(event) {
					if(__preventClickEvent) {
						__preventClickEvent = false;
						event.stopImmediatePropagation();
						return false;
					}
				});			
			}
			
			handler.filter(opts.nextPageHandler).bind("click", __slideNextPage);
			handler.filter(opts.nextPageHandler).bind("click", __slidePrevPage);	
			
			__initPages(workspace);
			
			return this;
		});
	};
})(jQuery);
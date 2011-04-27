# UPDATE, v0.55. #

Modified method. ".jqipslide2page" to .iphoneSlide("jqipslide2page", args), ".jqipblank2page" to .iphoneSlide("jqipblank2page", args), see the demo.html for more detail.

# UPDATE, v0.54. #

Add slide2page and blank2page. You can use ".jqipslide2page" to sliding the box to page, ".jqipblank2page" to add HTML-Code page in the box. See the demo.html for more detail.

# UPDATE, v0.53. #

Modified/Fixed next/prev page handler.

# UPDATE, v0.52. #

Fixed some event issue usr Namespace.

# UPDATE, v0.51. #

Add new setting "bounce" that you can turn on/off the default animate bounce effect.

# Configure #

    $('#album').iphoneSlide({
        // Page items handler, default: the first child of the $('album').
        handler: null,
        // Pages handler, default: the children of the handler.
        pageHandler : null,
        // Drag area handler, default: full page area.
        slideHandler : null,
        // You can define an element to handle this event(default: click) slide to next page.
        nextPageHandler : '.nextPage',
        // You can define an element to handle this event(default: click) slide to previous page.
        prevPageHandler : '.prevPage',
        // The friction of slide page.
        friction : 0.325,
        // When drag&drop page, the point length must be larger than this value which event will be fire.
        sensitivity : 20,
        // Slow down the page shift speed(ms).
        extrashift : 500,
        // If drag&drop over this time(ms), there will always slide 1 page.
        touchduring : 800,
        // Direction of slide, there are three directions you can choose(horizontal, vertical and matrix).
        direction : 'horizontal',
        // Max slide page.
        maxShiftPage : 5,
        // It's only for dynamic page(s).
        pageshowfilter : false,
        // Support jquery easing plugin, via http://gsgd.co.uk/sandbox/jquery/easing/
        easing: "swing",
        // Turn on/off default animate effect "bounce".
        bounce: true,
        // When slide page completed, fire this.
        onShiftComplete : function(elem, page) {
            // this is parent of the handler.
            // elem is nowPage's page item.
            // page is "nowPage".
        }
    });

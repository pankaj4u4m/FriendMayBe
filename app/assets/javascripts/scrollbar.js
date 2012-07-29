
(function($){
  $.fn.setScrollPane = function(options){
    options = options || {}
    this.each(function(){
      $(this).jScrollPane(options);
      reFormat(this, options);

      var api = $(this).data('jsp');
      var pan = $(this);
      var throttleTimeout;
      $(window).bind('resize',function(){

        if ($.browser.msie) {
          // IE fires multiple resize events while you are dragging the browser window which
          // causes it to crash if you try to update the scrollpane on every one. So we need
          // to throttle it to fire a maximum of once every 50 milliseconds...
          if (!throttleTimeout) {
            throttleTimeout = setTimeout( function(){
              api.reinitialise();
              throttleTimeout = null;
            },50);
          }
        } else {
          api.reinitialise();
        }
        reFormat(pan, options);
      });

      $('#chattypebox').keypress(function(e){
        var code = (e.keyCode ? e.keyCode : e.which);
        if(code == 13) { //Enter keycode
          if ($.browser.msie) {
            // IE fires multiple resize events while you are dragging the browser window which
            // causes it to crash if you try to update the scrollpane on every one. So we need
            // to throttle it to fire a maximum of once every 50 milliseconds...
            if (!throttleTimeout) {
              throttleTimeout = setTimeout( function(){
                api.reinitialise();
                throttleTimeout = null;
              },50);
            }
          } else {
            api.reinitialise();
          }
          reFormat(pan, options);
          return false;
        }
        return true;
      });

      function reFormat(pan, options){
        var vPan = $(pan).find('.jspVerticalBar').get(0);
        if(vPan != null){
          $(pan).find('.jspPane').width(
            $(this).width()+$(vPan).width()
            )
        }
        var hPan = $(pan).find('.jspHorizontalBar').get(0);
        if(hPan != null){
          $(pan).find('.jspPane').width(
            $(this).height()+$(hPan).height()
            )
        }
        if(options.width != null){
          $(pan).find('.jspVerticalBar').width(options.width);
        }
        if(options.height != null){
          $(pan).find('.jspHorizontalBar').height(options.height);
        }
        if(options.scrollToY){
          var api = $(pan).data('jsp')
          console.debug(api);
          api.scrollToY(options.scrollToY);
        }
      }
      return this;
    });
  }
})(jQuery);

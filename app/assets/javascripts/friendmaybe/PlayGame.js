(function ($) {
  jQuery.cachedPage = function(url, options) {

    // allow user to set any option except for dataType, cache, and url
    options = $.extend(options || {}, {
      dataType: "html",
      cache: false,
      url: url
    });

    // Use $.ajax() since it is more flexible than $.getScript
    // Return the jqXHR object so we can chain callbacks
    return jQuery.ajax(options);
  };


  function PlayGame(){
    var _appManager = null;

    var gameUrls = ['/apps/typing.html', '/apps/tetris.html', '/apps/pong.html'];
    var self = this;

    this.Constructor = function (appManager) {
      _appManager = appManager;
    };
    this.init = function () {

    };
    this.loadAGame = function(){
      var game = gameUrls[randomFromTo(0,gameUrls.length -1)]+'?width='+_appManager.width() + '&height='+_appManager.height();

      _appManager.loadAppContainer(game);
      _appManager.showAppContainer();
    };
    var randomFromTo = function(from, to){
      return Math.floor(Math.random() * (to - from + 1) + from);
    }
  }
  var _INSTANCE = new PlayGame();
  $.getPlayGame = function () {
    return _INSTANCE;
  };
})(jQuery);
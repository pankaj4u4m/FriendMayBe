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
    var index = Math.floor(Math.random() * (gameUrls.length));
    var self = this;

    this.Constructor = function (appManager) {
      _appManager = appManager;
    };
    this.init = function () {

    };
    this.loadAGame = function(){
      var game = gameUrls[index]+'?width='+_appManager.width() + '&height='+_appManager.height();
      index+=1;
      index = index%gameUrls.length;

      _appManager.loadAppContainer(game);
      _appManager.showAppContainer();
    };
  }
  var _INSTANCE = new PlayGame();
  $.getPlayGame = function () {
    return _INSTANCE;
  };
})(jQuery);
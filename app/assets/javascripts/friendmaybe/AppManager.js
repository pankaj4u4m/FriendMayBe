(function ($) {
  function AppManager() {
    var _xmppCore = null;

    var _width = 0;
    var _height = 0;
    var _callback = null;

    var self = this;

    var internal = false;

    this.Constructor = function (xmppCore) {
      _xmppCore = xmppCore;
    };

    this.getAppContainer = function () {
      return $('#app-container');
    };

    this.registerCallback = function (callback) {
      _callback = callback;
    };

    this.getInternalContainer = function () {
      _height = $('#chat-app').height();
      _width = $('#messagebar-fixed').width() / 2;
      self.hideAppContainer();
      $('#internalapp-container').width(_width);
      $('#internalapp-container').height(_height - 5);
      internal = true;
      return $('#internalapp-container');
    };

    this.loadAppContainer = function (url) {
      _height = $('#chat-app').height();
      _width = $('#messagebar-fixed').width() / 2;
      self.hideAppContainer();
      $('#app-container').width(_width);
      $('#app-container').height(_height - 5);
      $('#app-container').load(onload);
      $('#app-container').attr('src', url);
    };

    this.showAppContainer = function () {
      var appContainer = null;
      if (internal) {
        appContainer = $('#internalapp-container');
      } else {
        appContainer = $('#app-container');
      }
      $(appContainer).css({'right':"-600px"});
      $(appContainer).animate({'right':"0px"}, "slow", function () {
        $('#chat-app').width($('#chat-app').width() - $(appContainer).width());
        $('#' + _xmppCore.getCurrentUser().id).trigger("scrollResize");
      });
    };

    this.hideAppContainer = function () {

      $('#internalapp-container').empty();
      $('#internalapp-container').width(0);

      $('#app-container').removeAttr('src');
      $('#app-container').empty();
      $('#app-container').width(0);

      internal = false;
      $('#chat-app').width('auto');

      $('#' + _xmppCore.getCurrentUser().id).trigger("scrollResize");
    };

    this.height = function () {
      if (internal) {
        return $('#internalapp-container').height();
      }
      return $('#app-container').height();
    };

    this.width = function () {
      if (internal) {
        return $('#internalapp-container').width();
      }
      return $('#app-container').width();
    };

    var onload = function () {
      if (_callback) {
        _callback();
      }
    }
  }

  var _INSTANCE = new AppManager();
  $.getAppManager = function () {
    return _INSTANCE;
  };
})(jQuery);
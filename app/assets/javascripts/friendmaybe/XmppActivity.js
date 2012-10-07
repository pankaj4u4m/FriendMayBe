//= require ./Constants
//= require jquery/plugin/scrollbar
//= require ./XmppUtils
//=require ./UserLocation
(function ($) {
  function XmppActivity() {
    var _messageBox = null;
    var _notification = null;
    var _userLocation = null;
    var _xmppCore = null;
    var _xmppOnMethods = null;
    var _xmppUtils = null;

    var self = this;

    var isAnonymous = false;
    var errorConnection = false;

    this.Constructor = function (messageBox, notification, userLocation, xmppCore, xmppOnMethods, xmppUtils) {
      _messageBox = messageBox;
      _notification = notification;
      _userLocation = userLocation;
      _xmppCore = xmppCore;
      _xmppOnMethods = xmppOnMethods;
      _xmppUtils = xmppUtils;
    };

    var sendMessage = function (message) {
      var currentUser = _xmppCore.getCurrentUser();

      var msg = $msg({to:currentUser.jid, type:"chat"}).c("body").t(message);

      if(errorConnection) {
        var tryReconnect = $("<button class='btn-link'>Try Reconnect</button>");
        $(tryReconnect).click(function () {
          self.xmppStart();
        });
        _messageBox.eventMessage(currentUser.id, $("<span>You message is not delivered. This is because you might have disconnected. <span>").append(tryReconnect) );
      }
      _xmppCore.getConnection().send(msg);
    };

    var attach = function (data) {
      errorConnection = false;
      console.log('Prebind succeeded. Attaching...');

      var me = _xmppCore.getMy();
      me.isAnonymous = isAnonymous;
      me.node = data['jid']['node'];
      me.domain = data['jid']['domain'];
      me.resource = data['jid']['resource'];

      _userLocation.setUserLocation(me.resource);

      me.jid = me.node + '@' + me.domain + '/' + me.resource;
      me.id = _xmppUtils.jidToId(me.jid);
      _xmppCore.getConnection().attach(me.jid, data['http_sid'],
          parseInt(data['http_rid'], 10) + 2, _xmppOnMethods.onConnect);
    };

    var errorLogin = function (xhr, textStatus, errorThrown) {
      errorConnection = true;
      $('#remembereds ul .error').remove();
      var tryAgain = $("<button class='btn-link'>Try Again</button>");
      var tryReconnect = $("<button class='btn-link'>Try Reconnect</button>");
      $(tryAgain).click(function () {
        $('#remembereds ul .error').remove();
        self.xmppStart();
      });
      $(tryReconnect).click(function () {
        self.xmppStart();
      });
      var li = $("<li class='error'>Failed to connect </li>").append(tryAgain);
      $(li).css({'width':$('#sidebar').width(), 'height':$('#sidebar').height(), 'position':'absolute', 'backgroundColor':'#F7F8FA', 'opacity':'0.8'});


      $('#remembereds ul').prepend(li);
      if (_xmppCore.getCurrentUser().id) {
        _messageBox.eventMessage(_xmppCore.getCurrentUser().id, $("<span>Unable to connect right now. </span>").append(tryReconnect));
      }
    };

    var initiateConnection = function () {
      var prebind = Constants.PRE_BINDING;
      if (isAnonymous) {
        prebind = Constants.PRE_BINDING_ANONYMOUS;
      }
      var token = $('meta[name=csrf-token]').attr('content');
      var param = $('meta[name=csrf-param]').attr('content');
      var data = {};
      data[param] = token;

      $.ajax({
        type:'post',
        url:prebind,
        dataType:'json',
        tryCount:0,
        retryLimit:3,
        success:attach,
        data:data,
        error:function (xhr, textStatus, errorThrown) {
          if (textStatus == 'timeout') {
            this.tryCount++;
            if (this.tryCount <= this.retryLimit) {
              //try again
              $.ajax(this);
              return;
            }
            errorLogin(xhr, textStatus, errorThrown);
          }
          errorLogin(xhr, textStatus, errorThrown);
        }
      })
    };

    var connect = function () {
      var connection = new Strophe.Connection('http://bosh.metajack.im:5280/xmpp-httpbind');
      _xmppCore.setConnection(connection);
      _xmppCore.getConnection().connect("codegambler@gmail.com", "kim-10vriti", _xmppOnMethods.onConnect);
    };

    this.xmppStart = function () {
      _xmppCore.setConnection(new Strophe.Connection(Constants.BOSH_SERVICE));

      initiateConnection();
      //connect();
    };

    this.xmppSendMessage = function (msg) {
      if (_xmppCore.getCurrentUser().jid) {
        _notification.attachOneMessageNotification(Constants.MAX_LONG, msg, _xmppCore.getMy().jid, _xmppCore.getCurrentUser().jid);
        _messageBox.myInlineMessage(_xmppCore.getCurrentUser().id, msg);
        sendMessage(msg);
      }
    };

    this.xmppStranger = function () {
      var currentUser = _xmppCore.getCurrentUser();
      currentUser.node = Constants.SYSTEM_NODE;
      currentUser.resource = null;
      currentUser.jid = currentUser.node + '@' + _xmppCore.getMy().domain;
      currentUser.id = _xmppUtils.jidToId(currentUser.jid);
      currentUser.name = Constants.SYSTEM_NAME;

      _messageBox.newMessageBox.call($("<a data-toggle='tab' class='roster-contact'  href='#" + currentUser.id + "'></a>"),
          currentUser.id, currentUser, false);
      _messageBox.myInlineMessage(currentUser.id, Commands.CONNECT);
      sendMessage(Commands.CONNECT);
    };

    this.strangerChat = function () {
//      console.log(_xmppCore.getCurrentUser().status);
      var status = _xmppCore.getCurrentUser().status;
      if (status == null || status == ChatButtonStatus.HANGOUT) {
        _messageBox.changeChatStatusChanged(ChatButtonStatus.CONNECTING);
        self.xmppStranger();
      } else if (status == ChatButtonStatus.CONNECTING || status == ChatButtonStatus.DISCONNECT) {
        _messageBox.changeChatStatusChanged(ChatButtonStatus.CONFIRM_DISCONNECT);
      } else if (status == ChatButtonStatus.CONFIRM_DISCONNECT) {
        _messageBox.changeChatStatusChanged(ChatButtonStatus.HANGOUT);
        self.xmppSendMessage(Commands.DISCONNECT);
      }
    };
    this.anonymous = function () {
      isAnonymous = true;
      _xmppCore.getMy().isAnonymous = true;
      self.xmppStart();
    };
  }

  var _INSTANCE = new XmppActivity();
  $.getXmppActivity = function () {
    return _INSTANCE;
  };

})(jQuery);

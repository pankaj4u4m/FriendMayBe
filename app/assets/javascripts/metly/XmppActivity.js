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
    var toSend = null;

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
      try {
        _xmppCore.getConnection().send(msg);
      } catch (e) {
        try {
          _xmppCore.getConnection().reset();
          _xmppCore.getConnection().send(msg);
        } catch (e) {
          toSend = msg;
          if (isAnonymous) {
            self.anonymous();
          } else {
            self.xmppStart();
          }
        }
      }
    };

    var attach = function (data) {
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
          parseInt(data['http_rid'], 10) + 2,
          function (status) {
            if (status == Strophe.Status.CONNECTED || status == Strophe.Status.ATTACHED) {
              if (toSend) {
                _xmppCore.getConnection().send(toSend);
                toSend = null;
              }
            }
            return _xmppOnMethods.onConnect(status)
          });
      _xmppCore.getConnection().connectionmanager.enable(_initiateConnection);
    };

    var errorLogin = function () {
      $('#remembereds ul .error').remove();
      var tryAgain = $("<button class='btn-link'>Try again</button>");
      $(tryAgain).click(function () {
        $('#remembereds ul .error').remove();
        self.xmppStart();
      });
      var li = $("<li class='error'>Failed to connect </li>").append(tryAgain);
      $(li).css({'width':$('#sidebar').width(), 'height':$('#sidebar').height(), 'position':'absolute', 'backgroundColor':'#F7F8FA', 'opacity':'0.8'});


      $('#remembereds ul').prepend(li);
      if (_xmppCore.getCurrentUser().id) {
        _messageBox.eventMessage(_xmppCore.getCurrentUser().id, "Failed to connect to server. Messae not sent!");
      }
    };

    var _initiateConnection = function () {
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
            return;
          }
          errorLogin();
        }
      })
    };

    var _connect = function () {
      var connection = new Strophe.Connection('http://bosh.metajack.im:5280/xmpp-httpbind');
      _xmppCore.setConnection(connection);
      _xmppCore.getConnection().connect("codegambler@gmail.com", "kim-10vriti", _xmppOnMethods.onConnect);
    };

    this.xmppStart = function () {
      _xmppCore.setConnection(new Strophe.Connection(Constants.BOSH_SERVICE));

      _initiateConnection();
      //_connect();
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

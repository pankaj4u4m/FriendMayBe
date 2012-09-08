//= require ./Constants
//= require jquery/scrollbar
//= require ./XmppUtils
//=require ./UserLocation
(function ($) {
  function XmppActivity() {
    var _isAlive = null;
    var _getCurrentUser = null;
    var _setCurrentUser = null;
    var _getConnection = null;
    var _setConnection = null;
    var _jidToId = null;
    var _getMy = null;
    var _myInlineMessage = null;
    var _xmppSendMessage = null;
    var _newMessageBox = null;
    var _onRosterRemoved = null;
    var _onRosterAdded = null;
    var _eventMessage = null;
    var _setUserLocation = null;
    var _onConnect = null;
    var self = this;

    this.Constructor = function (isAlive, getCurrentUser, setCurrentUser, getConnection, setConnection, jidToId, getMy, myInlineMessage, xmppSendMessage, newMessageBox, onRosterRemoved, onRosterAdded, eventMessage, setUserLocation, onConnect) {
      _isAlive = isAlive;
      _getCurrentUser = getCurrentUser;
      _setCurrentUser = setCurrentUser;
      _getConnection = getConnection;
      _setConnection = setConnection;
      _jidToId = jidToId;
      _getMy = getMy;
      _myInlineMessage = myInlineMessage;
      _xmppSendMessage = xmppSendMessage;
      _newMessageBox = newMessageBox;
      _onRosterRemoved = onRosterRemoved;
      _onRosterAdded = onRosterAdded;
      _eventMessage = eventMessage;
      _setUserLocation = setUserLocation;
      _onConnect = onConnect;
    };

    var _sendMessage = function (message) {
      if (!_isAlive()) {
        console.log("Y m here?");
        _getConnection().reset();
      }
      if (!_getCurrentUser().jid) {
        _getCurrentUser().node = Constants.SYSTEM_NODE;
        _getCurrentUser().resource = null;
        _getCurrentUser().jid = _getCurrentUser().node + '@' + _getMy().domain;
        _getCurrentUser().id = _jidToId(_getCurrentUser().jid);

        _eventMessage(_getCurrentUser().id, "You haven't selected any user. Connection to stranger...");
      }
      var msg = $msg({to:_getCurrentUser().jid, type:"chat"}).c("body").t(message);
      _getConnection().send(msg);
    };

    var _attach = function (data) {
      console.log('Prebind succeeded. Attaching...');

      _getMy().node = data['jid']['node'];
      _getMy().domain = data['jid']['domain'];
      _getMy().resource = data['jid']['resource'];

      _setUserLocation(_getMy().resource);

      _getMy().jid = _getMy().node + '@' + _getMy().domain + '/' + _getMy().resource;

      _setConnection(new Strophe.Connection(Constants.BOSH_SERVICE));
      _getConnection().attach(_getMy().jid, data['http_sid'],
          parseInt(data['http_rid'], 10) + 2,
          _onConnect);
    };

    var _initiateConnection = function () {
      var token = $('meta[name=csrf-token]').attr('content');
      var param = $('meta[name=csrf-param]').attr('content');
      var data = {};
      data[param] = token;

      $.ajax({
        type      :'post',
        url       :Constants.PRE_BINDING,
        dataType  :'json',
        tryCount  :0,
        retryLimit:3,
        success   :_attach,
        data      :data,
        error     :function (xhr, textStatus, errorThrown) {
          if (textStatus == 'timeout') {
            this.tryCount++;
            if (this.tryCount <= this.retryLimit) {
              //try again
              $.ajax(this);
              return;
            }
            return;
          }
          if (xhr.status == 404) {
            //handle error
          } else {
            //handle error
          }

        }
      })
    };

    var _connect = function () {
      var connection = new Strophe.Connection('http://bosh.metajack.im:5280/xmpp-httpbind');
      _setConnection(connection);
      _getConnection().connect("codegambler@gmail.com", "kim-10vriti", _onConnect);
    };

    this.xmppStart = function () {
      _initiateConnection();
      //_connect();
    };

    this.xmppSendMessage = function (msg) {
      _sendMessage(msg);
      _myInlineMessage(_getCurrentUser().id, msg);
    };

    this.xmppStranger = function () {
      _getCurrentUser().node = Constants.SYSTEM_NODE;
      _getCurrentUser().resource = null;
      _getCurrentUser().jid = _getCurrentUser().node + '@' + _getMy().domain;
      _getCurrentUser().id = _jidToId(_getCurrentUser().jid);
      _getCurrentUser().name = Constants.SYSTEM_NAME;

      _newMessageBox.call($("<a data-toggle='tab' class='roster-contact'  href='#" + _getCurrentUser().id + "'></a>"),
          _getCurrentUser().id, _getCurrentUser(), true);
      _sendMessage("\\c");
      _myInlineMessage(_getCurrentUser().id, "\\c");
    };

    this.xmppStrangerDisconnect = function () {
      _xmppSendMessage("\\d");
      _setCurrentUser({});
    };

    this.xmppRemoveUser = function () {
      _getMy().roster.remove(_getCurrentUser().jid, _onRosterRemoved);
    };

    this.xmppAddUser = function () {
      var jid = _getCurrentUser().jid;
      var name = _getCurrentUser().name;

      name = name || null;
      _getMy().roster.add(jid, name, [], _onRosterAdded);

    };

//    this.xmppBlockUser = function () {
//      var jid = _getCurrentUser().jid;
//      var reason = $("#chattypebox").data('reason');
//      _xmppSendMessage("\\b:" + reason);
//      _getMy().roster.remove(jid, _onRosterRemoved);
//    };

    this.strangerChat = function () {
      console.log(_getCurrentUser().status);
      var status = _getCurrentUser().status;
      if (status == null || status == ChatButtonStatus.HANGOUT) {
        self.changeChatStatusChanged(ChatButtonStatus.CONNECTING);
        self.xmppStranger();
      } else if (status == ChatButtonStatus.CONNECTING || status == ChatButtonStatus.DISCONNECT) {
        self.changeChatStatusChanged(ChatButtonStatus.CONFIRM_DISCONNECT);
      } else if (status == ChatButtonStatus.CONFIRM_DISCONNECT) {
        self.changeChatStatusChanged(ChatButtonStatus.HANGOUT);
        self.xmppStrangerDisconnect();
      }
    };

    this.changeChatStatusChanged = function (status) {
      _getCurrentUser().status = status;
      if (status == ChatButtonStatus.CONNECTING) {
        $("#stranger").text("Connecting");
      } else if (status == ChatButtonStatus.CONFIRM_DISCONNECT) {
        $("#stranger").text("Are you sure?");
      } else if (status == ChatButtonStatus.DISCONNECT) {
        $("#stranger").text("Disconnect");
      } else if (status == ChatButtonStatus.HANGOUT) {
        $("#stranger").text("Hang Out");
      }
    };
  }

  var _INSTANCE = new XmppActivity();
  $.getXmppActivity = function () {
    return _INSTANCE;
  };

})(jQuery);

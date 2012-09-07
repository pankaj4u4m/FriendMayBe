(function ($) {

  function XmppOnMethods() {
    var _getConnection = null;
    var _getMy = null;
    var _setAlive = null;
    var _authorizationPopup = null;
    var _jidToId = null;
    var _getCurrentUser = null;
    var _eventMessage = null;
    var _changeChatStatusChanged = null;
    var _strangerInlineMessage = null;
    var _updateContact = null;
    var _getRosterElement = null;
    var _presenceValue = null;
    var _rosterStatus = null;
    var _newMessageBox = null;
    var self = this;

    this.init = function (getConnection, getMy, setAlive, authorizationPopup, jidToId, getCurrentUser, eventMessage, changeChatStatusChanged, strangerInlineMessage, updateContact, getRosterElement, presenceValue, rosterStatus, newMessageBox) {
      self.setAuthorizationPopupCallback(authorizationPopup);
      self.setGetConnectionCallback(getConnection);
      self.setGetCurrentUserCallback(getCurrentUser);
      self.setGetMyCallback(getMy);
      self.setSetAliveCallback(setAlive);
      self.setJidToIdCallback(jidToId);
      self.setEventMessageCallback(eventMessage);
      self.setChangeChatStatusChangedCallback(changeChatStatusChanged);
      self.setStrangerInlineMessageCallback(strangerInlineMessage);
      self.setUpdateContactCallback(updateContact);
      self.setGetRosterElementCallback(getRosterElement);
      self.setPresenceValueCallback(presenceValue);
      self.setRosterStatusCallback(rosterStatus);
      self.setNewMessageBoxCallback(newMessageBox);
    };
    this.setGetConnectionCallback = function (getConnection) {
      _getConnection = getConnection;
    };
    this.setGetMyCallback = function (getMy) {
      _getMy = getMy;
    };

    this.setSetAliveCallback = function (setAlive) {
      _setAlive = setAlive;
    };
    this.setAuthorizationPopupCallback = function (authorizationPopup) {
      _authorizationPopup = authorizationPopup;
    };
    this.setJidToIdCallback = function (jidToId) {
      _jidToId = jidToId;
    };
    this.setGetCurrentUserCallback = function (getCurrentUser) {
      _getCurrentUser = getCurrentUser;
    };
    this.setEventMessageCallback = function (eventMessage) {
      _eventMessage = eventMessage;
    };
    this.setChangeChatStatusChangedCallback = function (changeChatStatusChanged) {
      _changeChatStatusChanged = changeChatStatusChanged;
    };
    this.setStrangerInlineMessageCallback = function (strangerInlineMessage) {
      _strangerInlineMessage = strangerInlineMessage;
    };
    this.setUpdateContactCallback = function (updateContact) {
      _updateContact = updateContact;
    };
    this.setGetRosterElementCallback = function (getRosterElement) {
      _getRosterElement = getRosterElement;
    };
    this.setPresenceValueCallback = function (presenceValue) {
      _presenceValue = presenceValue;
    };
    this.setRosterStatusCallback = function (rosterStatus) {
      _rosterStatus = rosterStatus;
    };
    this.setNewMessageBoxCallback = function (newMessageBox) {
      _newMessageBox = newMessageBox;
    };


    this.onConnect = function (status) {
      _setAlive(false);
      if (status == Strophe.Status.CONNECTED || status == Strophe.Status.ATTACHED) {
        console.debug('Strophe is attached.');
        _getConnection().addHandler(self.onMessage, null, 'message', null);
        _getConnection().addHandler(self.onSubscribe, null, 'presence', 'subscribe');
        // Xmpp.connection.addHandler(Xmpp.onRosterChange, "jabber:iq:roster", "iq", "set");
//          connection.addHandler(Xmpp.onPresence, null, "presence");

        _getConnection().send($pres().tree());
        _getMy().roster = _getConnection().roster;
        _getMy().roster.registerCallback(self.onPresence);
        _getMy().roster.get(self.onRosterReceive);
        _setAlive(true);
        _newMessageBox.call($("<a data-toggle='tab' class='roster-contact'  href='#notification'></a>"), 'notification');
      }
    };
    this.onSubscribe = function (stanza) {
      console.log(stanza);
      var from = $(stanza).attr('from');
      var accepted = _authorizationPopup();
      if (accepted) {
        _getMy().roster.authorize(from);
      } else {
        _getMy().roster.unauthorize(from);
      }
      return true;
    };
    this.onMessage = function (message) {
//          console.log(message);
      var full_jid = $(message).attr('from');
      var type = $(message).attr('type');
      var jid = Strophe.getBareJidFromJid(full_jid);
      var id = _jidToId(jid);

      if (!_getMy().roster.findItem(Strophe.getBareJidFromJid(jid)) && _getCurrentUser().jid != full_jid) {
        return true;
      }
//          console.log(message);
      var composing = $(message).find('composing');
      if (composing.length > 0) {
        _eventMessage(id, Strophe.getNodeFromJid(jid) + " is typing...");
        return true;
      }

      var body = $(message).find("html > body");

      if (body.length === 0) {
        body = $(message).find('body');

        if (body.length > 0) {
          body = body.text()
        } else {
          body = null;
        }
      } else {
        body = body.contents();

        var span = $("<span></span>");
        body.each(function () {
          if (document.importNode) {
            $(document.importNode(this, true)).appendTo(span);
          } else {
            // IE workaround
            span.append(this.xml);
          }
        });
        body = span;
      }
      if (body) {
        if (type == 'error') {
          _eventMessage(id, body);
          if (_getCurrentUser().status == ChatButtonStatus.CONNECTING) {
            _changeChatStatusChanged(ChatButtonStatus.HANGOUT);
          }
        } else {
          if (_getCurrentUser().status == ChatButtonStatus.CONNECTING) {
            _changeChatStatusChanged(ChatButtonStatus.DISCONNECT);
          }
          _strangerInlineMessage(id, _getCurrentUser().name, body);
        }
      }
      return true;
    };

    this.onPresence = function (list, item) {
      console.log(item);
      if (item) {
        var contacts = $('#remembereds li');
        if (contacts.length > 0) {
          _updateContact(contacts, item);
        } else {
          var element = _getRosterElement(item);
          $('#remembereds ul').append(element);
          self.contactEventBind(element);
        }
      } else {
        self.onRosterReceive(list);
      }
      return true;
    };
    this.onRosterReceive = function (data) {
      console.log(data);
      data.sort(function (a, b) {
        var r = _presenceValue(_rosterStatus(b.resources)) - _presenceValue(_rosterStatus(a.resources));
        if (r == 0) {
          return (a.name || a.jid).localeCompare((b.name || b.jid));
        }

        return r;
      });
      $('#remembereds ul').empty();
      $(data).each(function () {
//            if(Strophe.getDomainFromJid(this.jid) == domain){
        var element = _getRosterElement(this);
        $('#remembereds ul').append(element);
//            }
      });
      self.contactEventBind($("#remembereds a"));
      return true;
    };
    this.onRosterRemoved = function (stanza) {
      $('#' + _getCurrentUser().id + ' button.remember').removeClass('remove').addClass('add').text('Remember');
      _getMy().roster.unsubscribe(_getCurrentUser().jid);
      self.onRosterReceive(_getMy().roster.items);
      _eventMessage(_getCurrentUser().node, "Forgotten!");
    };
    this.onRosterAdded = function (stanza) {
      $('#' + _getCurrentUser().id + ' button.remember').removeClass('add').addClass('remove').text('Forget');
      _getMy().roster.subscribe(_getCurrentUser().jid);
      self.onRosterReceive(_getMy().roster.items);
      _eventMessage(_getCurrentUser().node, "Remember request Sent!");
    };
    this.contactEventBind = function (element) {
      $(element).click(function (e) {
        e.preventDefault();
        var jid = $(this).find(".roster-jid").text();
        var id = $(this).attr("href").replace('#', '');
        var name = $(this).find('.roster-name').text();
        var pres = $(this).find('.roster-status');
        _getCurrentUser().name = name;
        _getCurrentUser().jid = jid;
        _getCurrentUser().node = Strophe.getNodeFromJid(_getCurrentUser().jid);
        _getCurrentUser().id = id;
        _getCurrentUser().pres = pres;
//            console.log(currentUser);
        _newMessageBox.call(this, _getCurrentUser().id, _getCurrentUser(), false);
      });
      $('div.scrollable').trigger('scrollResize');
      $('input#searchTerm').quicksearch('#remembereds li', {
        'selector':'.roster-name',
        'onAfter':function () {
          $('div.scrollable').trigger('scrollResize');
          }
      });
    };
  }

  var _INSTANCE = new XmppOnMethods();
  $.getXmppOnMethods = function () {
    return _INSTANCE;
  };
})(jQuery);

(function ($) {

  function XmppOnMethods() {
    var _getConnection = null;
    var _getMy = null;
    var _setAlive = null;
    var _attachOneRequestNotification = null;
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

    this.Constructor = function (getConnection, getMy, setAlive, attachOneRequestNotification, jidToId, getCurrentUser, eventMessage, changeChatStatusChanged, strangerInlineMessage, updateContact, getRosterElement, presenceValue, rosterStatus, newMessageBox) {
      _attachOneRequestNotification = attachOneRequestNotification;
      _getConnection = getConnection;
      _getCurrentUser = getCurrentUser;
      _getMy = getMy;
      _setAlive = setAlive;
      _jidToId = jidToId;
      _eventMessage = eventMessage;
      _changeChatStatusChanged = changeChatStatusChanged;
      _strangerInlineMessage = strangerInlineMessage;
      _updateContact = updateContact;
      _getRosterElement = getRosterElement;
      _presenceValue = presenceValue;
      _rosterStatus = rosterStatus;
      _newMessageBox = newMessageBox;
    };

    this.onConnect = function (status) {
      _setAlive(false);
      if (status == Strophe.Status.CONNECTED || status == Strophe.Status.ATTACHED) {
        console.debug('Strophe is attached.');

        _getConnection().addHandler(self.everything);

        _getConnection().addHandler(self.onMessage, null, 'message', null);
        _getConnection().addHandler(self.onIq, null, 'iq', null, null, null);
        _getConnection().addHandler(self.onSubscribe, null, 'presence', 'subscribe', null, null);
        // Xmpp.connection.addHandler(Xmpp.onRosterChange, "jabber:iq:roster", "iq", "set");
//          connection.addHandler(Xmpp.onPresence, null, "presence");

        _getConnection().send($pres().tree());
        _getMy().roster = _getConnection().roster;
        _getMy().roster.registerCallback(self.onPresence);
        _getMy().roster.get(self.onRosterReceive);
        _setAlive(true);
        return true;
      }
    };
    this.everything = function (stanza) {
      console.log(stanza);
      return true;
    };
    this.onIq = function (iq) {
      console.log(iq);
      return true;
    };
    this.onSubscribe = function (stanza) {
      console.log(stanza);
      var from = $(stanza).attr('from');
      try {
        var accepted = _attachOneRequestNotification();
        if (accepted) {
          _getMy().roster.subscribe(from);
          _getMy().roster.authorize(from);
        } else {
//          _getMy().roster.unsubscribe(from);
//          _getMy().roster.unauthorize(from);
//        _getMy().roster.remove(from);
        }
      } catch (error) {
        console.log(error);
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
      if (item) {
        var contacts = $('#remembereds li');
        if (contacts.length > 0) {
          _updateContact(contacts, item);
        } else {
          var element = _getRosterElement(item);
          $('#remembereds ul').append(element);
          self.contactEventBind(element.find('a'));
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
        'onAfter' :function () {
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

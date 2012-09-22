(function ($) {

  function XmppOnMethods() {
    var _messageBox = null;
    var _notification = null;
    var _xmppCore = null;
    var _xmppUtils = null;

    var self = this;

    this.Constructor = function (messageBox, notification, xmppCore, xmppUtils) {
      _messageBox = messageBox;
      _notification = notification;
      _xmppCore = xmppCore;
      _xmppUtils = xmppUtils;
    };

    this.onConnect = function (status) {
      _xmppCore.setAlive(false);
      if (status == Strophe.Status.CONNECTED || status == Strophe.Status.ATTACHED) {
        console.debug('Strophe is attached.');

        _xmppCore.getConnection().addHandler(self.onMessage, null, 'message', null);
        _xmppCore.getConnection().send($pres().tree());
        _xmppCore.getMy().roster = _xmppCore.getConnection().roster;

        if (!_xmppCore.getMy().isAnonymous) {
          _xmppCore.getConnection().addHandler(self.onSubscribe, null, 'presence', 'subscribe', null, null);
          _xmppCore.getMy().roster.registerCallback(self.onPresence);
          _xmppCore.getMy().roster.get(self.onRosterReceive);
        } else {
          $('#remembereds ul').empty();
          $('#remembereds ul').append("<li>No contacts for anonymous user</li>")
        }
        _xmppCore.setAlive(true);
        return true;
      }
    };

    this.onSubscribe = function (stanza) {
      console.log(stanza);
      var from = $(stanza).attr('from');
      _xmppCore.getConnection().vcard.get(function (iq) {
        var name = $(iq).find('NICKNAME').text() || from;
        var roster = _xmppCore.getMy().roster.findItem(from);
        roster.name = name;
        _xmppUtils.updateContact($('#remembereds li'), roster);
        _notification.attachOneRequestNotification(from, name);
      }, from, error);

      return true;
    };
    var error = function (iq) {
      console.log(iq);
    };
    this.onMessage = function (message) {
//          console.log(message);
      var full_jid = $(message).attr('from');
      var type = $(message).attr('type');
      var jid = Strophe.getBareJidFromJid(full_jid);
      var id = _xmppUtils.jidToId(full_jid);

      if (!_xmppCore.getMy().roster.findItem(Strophe.getBareJidFromJid(jid)) && _xmppCore.getCurrentUser().jid != full_jid) {
        return true;
      }
//          console.log(message);
      var composing = $(message).find('composing');
      if (composing.length > 0) {
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
          _messageBox.eventMessage(id, body);
          if (_xmppCore.getCurrentUser().status == ChatButtonStatus.CONNECTING) {
            _messageBox.changeChatStatusChanged(ChatButtonStatus.HANGOUT);
          }
          if (body.match(new RegExp("User has Disconnected"))){
            _messageBox.changeChatStatusChanged(ChatButtonStatus.HANGOUT);
          }
        } else {
          if (_xmppCore.getCurrentUser().status == ChatButtonStatus.CONNECTING) {
            _messageBox.changeChatStatusChanged(ChatButtonStatus.DISCONNECT);
          }
          _notification.attachOneMessageNotification(Constants.MAX_LONG, body, full_jid, _xmppCore.getMy().jid);
          _messageBox.strangerInlineMessage(id, _xmppCore.getCurrentUser().name, body);
        }
      }
      return true;
    };

    this.onPresence = function (list, item) {
      if (item) {
        var contacts = $('#remembereds li');
        if (contacts.length > 0) {
          _xmppUtils.updateContact(contacts, item);
        } else {
          var element = _xmppUtils.getRosterElement(item);
          $('#remembereds ul').append(element);
          self.contactEventBind(element.find('a'));
        }
      } else {
        self.onRosterReceive(list);
      }
      $('.remember').removeClass('remove').addClass('add').text('Remember')
      $('.buddy-status').removeClass('online').removeClass('away').removeClass('offline').addClass('offline');
      for (var i = 0; i < list.length; ++i) {
        _notification.updateNotificationUserStatusName(_xmppUtils.jidToId(list[i].jid), list[i].name
            || list[i].jid, _xmppUtils.rosterStatus(list[i].resources));
        _messageBox.chatOptions(_xmppUtils.jidToId(list[i].jid), _xmppUtils.rosterStatus(list[i].resources), true);
      }
      return true;
    };
    this.onRosterReceive = function (list) {
      $('.sidebar-fixed').addClass('white');
//      console.log(list);
      list.sort(function (a, b) {
        var r = _xmppUtils.presenceValue(_xmppUtils.rosterStatus(b.resources)) - _xmppUtils.presenceValue(_xmppUtils.rosterStatus(a.resources));
        if (r == 0) {
          return (a.name || a.jid).localeCompare((b.name || b.jid));
        }

        return r;
      });
      $('#remembereds ul').empty();
      $(list).each(function () {
        var element = _xmppUtils.getRosterElement(this);
        $('#remembereds ul').append(element);

        var name = this.name;
        var jid = this.jid;
        var roster = this;
        //TODO check it in system side
        if ((name == null || name == Constants.SYSTEM_NAME || name == jid ) && roster.subscription == 'both') {
          _xmppCore.getConnection().vcard.get(function (iq) {
            roster.name = $(iq).find('NICKNAME').text() || jid;
            _xmppCore.getMy().roster.update(jid, roster.name, [], function () {
              _xmppUtils.updateContact($('#remembereds li'), roster);
            });
          }, jid, error);
        } else {

        }
      });
      self.contactEventBind($("#remembereds a"));
      return true;
    };
    this.onRosterRemoved = function (stanza) {
      $('.' + _xmppCore.getCurrentUser().id + ' button.remember').removeClass('remove').addClass('add').text('Remember');
      _xmppCore.getMy().roster.unsubscribe(_xmppCore.getCurrentUser().jid);
      self.onRosterReceive(_xmppCore.getMy().roster.items);
      _messageBox.eventMessage(_xmppCore.getCurrentUser().node, "Forgotten!");
      _notification.updateNotificationUserStatusName(_xmppUtils.jidToId(_xmppCore.getCurrentUser().jid), _xmppCore.getCurrentUser().name || _xmppCore.getCurrentUser().jid, _xmppCore.getRosterStatus(_xmppCore.getCurrentUser().jid));
    };
    this.onRosterAdded = function (stanza) {
      $('.' + _xmppCore.getCurrentUser().id + ' button.remember').removeClass('add').addClass('remove').text('Forget');

      self.onRosterReceive(_xmppCore.getMy().roster.items);
      _messageBox.eventMessage(_xmppCore.getCurrentUser().node, "Remember request Sent!");

    };
    this.contactEventBind = function (element) {
      $(element).click(function (e) {
        e.preventDefault();
        var jid = $(this).find(".roster-jid").text();
        var id = $(this).attr("href").replace('#', '');
        var name = $(this).find('.roster-name').text();
        var pres = $(this).find('.roster-status');
        var currentUser = _xmppCore.getCurrentUser();
        currentUser.name = name;
        currentUser.jid = jid;
        currentUser.node = Strophe.getNodeFromJid(currentUser.jid);
        currentUser.id = id;
        currentUser.pres = pres;
//            console.log(currentUser);
        _messageBox.newMessageBox.call(this, currentUser.id, currentUser, true);
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

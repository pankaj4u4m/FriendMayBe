//= require ./XmppUtils
(function ($) {
  function MessageBox() {
    var _notification = null;
    var _xmppActivity = null;
    var _xmppCore = null;
    var _xmppUtils = null;

    var self = this;
    var currentTab = null;
    var dateTime = new Date();
    var typingTime = 0;
    var isComposing = false;
    var times = 0;

    this.Constructor = function (notification, xmppActivity, xmppCore, xmppUtils) {
      _notification = notification;
      _xmppActivity = xmppActivity;
      _xmppCore = xmppCore;
      _xmppUtils = xmppUtils;
    };
    this.init = function () {
      $('#logout').click(function () {
        if (_xmppCore.getConnection()) {
          _xmppCore.getConnection().disconnect('logout');
          _xmppCore.getConnection().connectionmanager.disable();
        }
      });
      $("#message-scroll").setScrollPane({
        scrollToY:$('#message-scroll').data('jsp') == null ? 10000 : $('#message-scroll').data('jsp').getContentPositionY(),
        width:13,
        height:10,
        maintainPosition:false,
        outer:true
      });
      $('div.scrollable').setScrollPane({
        hideFocus:true,
        autohide:true
      });
      $("#chattypebox").keypress(function (e) {
        var code = (e.keyCode ? e.keyCode : e.which ? e.which : e.charCode);
        times += 1;
        typingTime = dateTime.getTime();
        if (times > 5) {
          sendComposeMessage();
          times = 0;
        }
        if (code == 13) { //Enter keycode
          var msg = $(this).val().trim();
          if (msg && msg.length) {
            if (msg.length < 1000) {
              _xmppActivity.xmppSendMessage(msg);
              $(this).val("");
            } else {
              self.eventMessage(_xmppCore.getCurrentUser().id, "Unable to send. Message size exceed 1000 characters");
            }
          }

          return false;
        }
        return true;
      });
      $("#stranger").click(function () {
        _xmppActivity.strangerChat();
      });
      $(document).bind('composing.chatstates', function (e, jid) {
        var id = _xmppUtils.jidToId(jid);
        $('#' + id + ' .chat-chats .chat-temp-event').remove();
        $('#' + id + ' .chat-chats').append(
            "<div class='chat-temp-event'>-" + _xmppCore.getRosterName(jid) + " is Typing...</div>");
        $('#' + id).trigger("scrollResize");
        setTimeout(function () {
          $('#' + id + ' .chat-chats .chat-temp-event').fadeOut('slow', function () {
            $(this).remove();
          });
        }, 6000);
      });
      $(document).bind('paused.chatstates', function (e, jid) {
        var id = _xmppUtils.jidToId(jid);
        $('#' + id + ' .chat-chats .chat-temp-event').remove();
        $('#' + id + ' .chat-chats').append(
            "<div class='chat-temp-event'>-" + _xmppCore.getRosterName(jid) + " has stopped Typing.</div>");
        $('#' + id).trigger("scrollResize");
        setTimeout(function () {
          $('#' + id + ' .chat-chats .chat-temp-event').fadeOut('slow', function () {
            $(this).remove();
          });
        }, 3000);
      });
      $('.optionbar-fixed button.remember').click(function (e) {
        e.preventDefault();
        if ($(this).hasClass('disabled')) {
          self.eventMessage(_xmppCore.getCurrentUser().node, "Can't remember in anonymous login");
          return;
        }
        if ($(this).hasClass('remove')) {
          _xmppCore.removeUser();
        } else if ($(this).hasClass('add')) {
          _xmppCore.addUser();
        }
      });
      $('#modal-yes').click(function(e){
        e.preventDefault();
        currentTab = Constants.NOTIFICATION;
        self.newMessageBox.call(this, Constants.NOTIFICATION)
      });
    };
    var sendComposeMessage = function () {
      if (!isComposing && _xmppCore.getConnection()) {
        _xmppCore.getConnection().chatstates.sendComposing(_xmppCore.getCurrentUser().jid, 'chat');
        isComposing = true;
        setTimeout(function () {
          var t = new Date().getTime();
          if (( t - typingTime > 5000) && isComposing) {
            _xmppCore.getConnection().chatstates.sendPaused(_xmppCore.getCurrentUser().jid, 'chat');
            isComposing = false;
          }
        }, 5000);
      }
    };
    var chatBox = function (selector, user, isRemembered) {
      user.id = user.id || Constants.SYSTEM_NODE;
      console.log("parameter node:" + selector + " jid:" + user.jid);
      if ($("#" + selector).length <= 0) {
        var chatbar = $("<div id='" + selector + "' class='tab-pane'></div>");
        chatbar.append("<div class='chat-scroll'><div class='chat-chats'></div></div>");
        var messageBar = $("#messagebar");
        $(messageBar).append(chatbar);
      }
      $('.optionbar-fixed .buddy-name a').attr('href', '#' + selector).html(user.name || Constants.SYSTEM_NAME);
      $('#message-scroll').addClass('white');
      self.chatOptions(selector, _xmppUtils.presenceValue(user.pres), isRemembered);
    };
    this.chatOptions = function (selector, presence, isRemembered) {

      $('.optionbar-fixed .buddy-options').removeClass('hidden');

      $('.optionbar-fixed .buddy-options .remember').removeClass('remove add disabled')
          .addClass((_xmppCore.getMy().isAnonymous ? "disabled" : ""));

      if (!isRemembered) {
        $('.optionbar-fixed .buddy-status').addClass('hidden');
        $('.optionbar-fixed .buddy-options .remember').removeClass('remove').addClass('add').text('Remember')
      } else {
        $('.optionbar-fixed .buddy-status').removeClass('hidden');
        _xmppUtils.setPresence($('.optionbar-fixed .buddy-status'), presence);
        if (Strophe.getNodeFromJid(selector) != Constants.SYSTEM_NODE) {
          $('.optionbar-fixed .buddy-options .remember').removeClass('add').addClass('remove').text('Forget')
        } else {
          $('.optionbar-fixed .buddy-options .remember').removeClass('remove').addClass('add').text('Remember')
        }
      }
    };
    this.eventMessage = function (messageBoxID, message) {
      if (!messageBoxID) {
        return;
      }
      var event = $("<div class='chat-event'> -</div>").append(message);
      $('#' + messageBoxID + ' .chat-chats').append(event);
      $('#' + messageBoxID).trigger("scrollResize");
//      setTimeout(function(){
//        $(event).fadeOut('slow', function(){
//            $(this).remove();
//        });
//        $('#' + messageBoxID).trigger("scrollResize");
//      }, 10000);
    };

    this.strangerInlineMessage = function (messageBoxID, jid, message) {
      if (!messageBoxID) {
        return;
      }
      if ($("#" + messageBoxID).length <= 0) {
        chatBox(messageBoxID, _xmppCore.getMy().roster.findItem(jid), true);
      }
      isComposing = false;
      $('#' + messageBoxID + ' .chat-chats .chat-temp-event').remove();
      $('#' + messageBoxID + ' .chat-chats .chat-event').remove();
      var chat = $("<div class='chat'></div>");
      var command = _xmppUtils.isCommand(message);
      if (command) {
        self.eventMessage(messageBoxID, message);
      } else {
        $(chat).append("<p class='chat stranger'><strong class='blue-text'>" + _xmppCore.getRosterName(jid).split(" ")[0] + ": </strong>" +
            message + "</p></div>");

        $('#' + messageBoxID + " .chat-chats").append(chat);
        $('#' + messageBoxID).trigger("scrollResize");
        $(chat).autoLink({class:'btn-link'});
        $(chat).emoticonize();
      }

    };
    this.myInlineMessage = function (messageBoxID, message) {
      if (!messageBoxID) {
        return;
      }
      isComposing = false;
      $('#' + messageBoxID + ' .chat-chats .chat-temp-event').remove();
      var chat = $("<div class='chat'></div>");
      var command = _xmppUtils.isCommand(message);
      if (command) {
        if (message == '\\c' && messageBoxID == Constants.SYSTEM_NODE) {
          $('#' + messageBoxID + "  div.chat-chats").empty();
        }
        self.eventMessage(messageBoxID, command);
      } else {

        $(chat).append("<p class='chat me'><strong>You: </strong>" +
            message + "</p></div>")
      }
      $('#' + messageBoxID + " .chat-chats").append(chat);
      $('#' + messageBoxID).trigger("scrollResize");
      $(chat).autoLink({class:'btn-link'});
      $(chat).emoticonize();

    };

    this.newMessageBox = function (selector, user, isRemembered) {
      if (!selector) {
        return;
      }
      console.log(selector);
      if (selector == Constants.NOTIFICATION && currentTab == Constants.SYSTEM_NODE) {
        $('#myModal').modal();
      } else {
        if (selector == Constants.NOTIFICATION) {
          if (_xmppCore.getCurrentUser().node == Constants.SYSTEM_NODE) {
            _xmppActivity.xmppSendMessage(Commands.DISCONNECT);
          }
          self.changeChatStatusChanged(ChatButtonStatus.HANGOUT);
          _notification.notificationBox(selector);

        } else {
          chatBox(selector, user, isRemembered);
        }
        $('#remembereds li').removeClass('active');
        $(this).tab('show');
        $(this).bind('shown', function (e) {
          $(this).trigger("scrollResize");
        });
        currentTab = selector;
      }
    };

    this.changeChatStatusChanged = function (status) {
      if (status == null || status == undefined) {
        return;
      }
      $('#message-scroll').addClass('white');
      if (status == ChatButtonStatus.CONNECTING) {
        _xmppCore.getCurrentUser().status = status;
        $("#stranger").text("Connecting");
      } else if (status == ChatButtonStatus.CONFIRM_DISCONNECT) {
        _xmppCore.getCurrentUser().status = status;
        $("#stranger").text("Are you sure?");
      } else if (status == ChatButtonStatus.DISCONNECT) {
        _xmppCore.getCurrentUser().status = status;
        $("#stranger").text("Disconnect");
      } else if (status == ChatButtonStatus.HANGOUT) {
        _xmppCore.setCurrentUser({});
        $('#message-scroll').removeClass('white');
        $("#stranger").text("Lets Talk");
      }
    };
  }

  var _INSTANCE = new MessageBox();

  $.getMessageBox = function () {
    return _INSTANCE;
  };
})(jQuery);
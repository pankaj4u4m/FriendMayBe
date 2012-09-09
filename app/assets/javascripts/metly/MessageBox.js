//= require ./XmppUtils
(function ($) {
  function MessageBox() {
    var _notificationBox = null;
    var _isCommand = null;
    var _xmppRemoveUser = null;
    var _xmppAddUser = null;
    var _setPresence = null;
    var _presenceValue = null;
    var _getCurrentUser = null;
    var _xmppSendMessage = null;
    var _strangerChat = null;
    var _setCurrentUser = null;
    var _getConnection = null;
    var _jidToId = null;
    var _getRosterName = null;

    var self = this;
    var currentTab = null;
    var dateTime = new Date();
    var typingTime = 0;
    var isComposing = false;

    this.Constructor = function (notificationBox, isCommand, xmppRemoveUser, xmppAddUser, setPresence, presenceValue,
                                 getCurrentUser, xmppSendMessage, strangerChat, setCurrentUser, getConnection, jidToId,
                                 getRosterName) {
      _notificationBox = notificationBox;
      _isCommand = isCommand;
      _xmppRemoveUser = xmppRemoveUser;
      _xmppAddUser = xmppAddUser;
      _setPresence = setPresence;
      _presenceValue = presenceValue;
      _getCurrentUser = getCurrentUser;
      _xmppSendMessage = xmppSendMessage;
      _strangerChat = strangerChat;
      _setCurrentUser = setCurrentUser;
      _getConnection = getConnection;
      _jidToId = jidToId;
      _getRosterName = getRosterName;
    };
    this.init = function(){
      $('#modal-yes').click(function(){
         self.newMessageBox.call(this, Constants.NOTIFICATION)
      });
      $("#message-scroll").setScrollPane({
        scrollToY       :$('#message-scroll').data('jsp') == null ? 10000 : $('#message-scroll').data('jsp').getContentPositionY(),
        width           :13,
        height          :10,
        maintainPosition:false,
        outer           :true
      });
      $('div.scrollable').setScrollPane({
        hideFocus:true,
        autohide:true
      });
      $("#chattypebox").keypress(function (e) {
        var code = (e.keyCode ? e.keyCode : e.which ? e.which : e.charCode);
        _sendComposeMessage();
        if (code == 13) { //Enter keycode
          var msg = $(this).val().trim();
          if (msg && msg.length) {
            _xmppSendMessage(msg);
          }

          $(this).val("");

          return false;
        }
        return true;
      });
      $("#stranger").click(function () {
        _strangerChat();
      });
      $(document).bind('composing.chatstates', function(e, jid){
        var id = _jidToId(jid);
        $('#' + id + ' .chat-chats .chat-temp-event').remove();
        $('#' + id + ' .chat-chats').append(
            "<div class='chat-temp-event'>-" + _getRosterName(jid) + " is Typing...</div>");
        $('#' + id).trigger("scrollResize");
//        setTimeout(function () {
//          $('#' + id + ' .chat-chats .chat-temp-event').remove();
//        }, 10000)
      });
      $(document).bind('paused.chatstates', function(e, jid){
        var id = _jidToId(jid);
        $('#' + id + ' .chat-chats .chat-temp-event').remove();
        $('#' + id + ' .chat-chats').append(
            "<div class='chat-temp-event'>-" + _getRosterName(jid) + " has stopped Typing.</div>");
        $('#' + id).trigger("scrollResize");
//        setTimeout(function () {
//          $('#' + id + ' .chat-chats .chat-temp-event').remove();
//        }, 10000)
      })
    };
    var _sendComposeMessage = function(){
      if(!isComposing) {
        _getConnection().chatstates.sendComposing(_getCurrentUser().jid, 'chat');
        isComposing = true;
        setTimeout(function(){
          var t = new Date().getTime();
          if(( t - typingTime > 5000) && isComposing){
            _getConnection().chatstates.sendPaused(_getCurrentUser().jid, 'chat');
            isComposing = false;
          }
        }, 10000);
      }
      typingTime = dateTime.getTime();
    };
    var _chatBox = function (selector, user, isStranger) {
      user.id = user.id || Constants.SYSTEM_NODE;
      console.log("parameter node:" + selector + " jid:" + user.jid);
      if ($("#" + selector).length <= 0) {

        var chatbar = $("<div id='" + selector + "' class='tab-pane'></div>");
        chatbar.append("<div class='optionbar-fixed'>"
            + "<div class='buddy-status'> </div>"
            + "<div class='buddy-name'><a data-toggle='tab' href='#" + selector + "' style='color: #3366CC;'>" + (user.name || Constants.SYSTEM_NAME) + "</a> </div>"
            + "<div class='buddy-options'>"
            + "<button class='remember btn btn-primary " + (isStranger ? "add" : "remove") + "'>(isStranger?Remember:Forget)</button>"
            + "</div>"
            + "</div>");

        chatbar.append("<div class='chat-scroll'><div class='chat-chats'></div></div>");


        var messageBar = $("#messagebar");
        $(messageBar).append(chatbar);
        $('#message-scroll').addClass('white');
        $('#' + selector + ' button.remember').click(function (e) {
          e.preventDefault();
          console.log(this);
          if ($(this).hasClass('remove')) {
            _xmppRemoveUser();
          } else if ($(this).hasClass('add')) {
            _xmppAddUser();
          }
        })
      }
      _chatOptions(selector, user, isStranger);
    };
    var _chatOptions = function (selector, user, isStranger) {
      if (isStranger) {
        $('#' + selector + '  .remember').removeClass('remove').addClass('add').text('Remember')
      } else {
        _setPresence($('#' + selector + '  .buddy-status'), _presenceValue(user.pres));
        $('#' + selector + '  .remember').removeClass('add').addClass('remove').text('Forget')
      }
    };
    this.eventMessage = function (messageBoxID, message) {
      $('#' + messageBoxID + ' .chat-chats').append(
          "<div class='chat-event'>-" + message + "</div>");
      $('#' + messageBoxID).trigger("scrollResize");
    };

    this.chatShortEvent = function (messageBoxID, message) {
      $('#' + messageBoxID + ' .chat-chats').find('.chat-temp-event').remove();
      $('#' + messageBoxID + ' .chat-chats').append(
          "<div class='chat-temp-event'>-" + message + "</div>");
      $('#' + messageBoxID).trigger("scrollResize");
      setTimeout(function () {
        $('#' + messageBoxID + ' .chat-chats').find('.chat-temp-event').remove();
      }, 5000)
    };

    this.strangerInlineMessage = function (messageBoxID, name, message) {
      isComposing = false;
      $('#' + messageBoxID + ' .chat-chats .chat-temp-event').remove();
      var chat = $("<div class='chat'></div>");
      var command = _isCommand(message);
      if (command) {
        self.eventMessage(messageBoxID, message);
      } else {
        $(chat).append("<p class='chat stranger'><strong class='blue-text'>" + name + ": </strong>" +
            message + "</p></div>");
        $('#' + messageBoxID + " .chat-chats").append(chat);
        $('#' + messageBoxID).trigger("scrollResize");
        $(chat).emoticonize();
      }

    };
    this.myInlineMessage = function (messageBoxID, message) {
      isComposing = false;
      $('#' + messageBoxID + ' .chat-chats .chat-temp-event').remove();
      var chat = $("<div class='chat'></div>");
      var command = _isCommand(message);
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
      $(chat).emoticonize();
    };

    this.newMessageBox = function (selector, user, isStranger) {
      console.log(selector);
      if (selector == Constants.NOTIFICATION && currentTab == Constants.SYSTEM_NODE) {
        $('#myModal').modal();
      } else {
        if (selector == Constants.NOTIFICATION) {
          _notificationBox(selector);
          self.changeChatStatusChanged(ChatButtonStatus.HANGOUT);
        } else {
          _chatBox(selector, user, isStranger);
        }
        $('#remembereds li').removeClass('active');
        $(this).tab('show');
        $(this).bind('shown', function (e) {
          $(this).trigger("scrollResize");
        });
      }
      currentTab = selector;
    };
    this.changeChatStatusChanged = function (status) {
      _getCurrentUser().status = status;
      $('#message-scroll').addClass('white');
      if (status == ChatButtonStatus.CONNECTING) {
        $("#stranger").text("Connecting");
      } else if (status == ChatButtonStatus.CONFIRM_DISCONNECT) {
        $("#stranger").text("Are you sure?");
      } else if (status == ChatButtonStatus.DISCONNECT) {
        $("#stranger").text("Disconnect");
      } else if (status == ChatButtonStatus.HANGOUT) {
        _setCurrentUser({});
        $('#message-scroll').removeClass('white');
        $("#stranger").text("Hang Out");
      }
    };
  }

  var _INSTANCE = new MessageBox();

  $.getMessageBox = function () {
    return _INSTANCE;
  };
})(jQuery);
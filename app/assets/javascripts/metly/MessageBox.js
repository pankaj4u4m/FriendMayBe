//= require ./XmppUtils
(function ($) {
  function MessageBox() {
    var _notificationBox = null;
    var _isCommand = null;
    var _xmppRemoveUser = null;
    var _xmppAddUser = null;
    var _setPresence = null;
    var _presenceValue = null;
    var _changeChatStatusChanged = null;

    var self = this;
    var currentTab = null;

    this.Constructor = function (notificationBox, isCommand, xmppRemoveUser, xmppAddUser, setPresence, presenceValue,
                                 changeChatStatusChanged) {
      _notificationBox = notificationBox;
      _isCommand = isCommand;
      _xmppRemoveUser = xmppRemoveUser;
      _xmppAddUser = xmppAddUser;
      _setPresence = setPresence;
      _presenceValue = presenceValue;
      _changeChatStatusChanged = changeChatStatusChanged;
    };
    this.init = function(){
      $('#modal-yes').click(function(){
         self.newMessageBox.call(this, Constants.NOTIFICATION)
      });
      self.newMessageBox.call($("<a data-toggle='tab' class='roster-contact'  href='#"+ Constants.NOTIFICATION +"'></a>"), Constants.NOTIFICATION);
    };

    this.eventMessage = function (messageBoxID, message) {
      $('#' + messageBoxID + ' .chat-chats').append(
          "<div class='chat-event'>-" + message + "</div>");
      $('#' + messageBoxID).trigger("scrollResize");
    };

    this.chatEvent = function (messageBoxID, message) {
      $('#' + messageBoxID + ' .chat-chats').find('.chat-temp-event').remove();
      $('#' + messageBoxID + ' .chat-chats').append(
          "<div class='chat-temp-event'>-" + message + "</div>");
      $('#' + messageBoxID).trigger("scrollResize");
      setTimeout(function () {
        $('#' + messageBoxID + ' .chat-chats').find('.chat-temp-event').remove();
      }, 5000)
    };

    this.strangerInlineMessage = function (messageBoxID, name, message) {
      var event = $('#' + messageBoxID + ' > div:last-child');
      if (event.hasClass(".chat-event")) {
        event.parent().remove();
      }
      var chat = $("<div class='chat'></div>");
      var command = _isCommand(message);
      if (command) {
        self.eventMessage(messageBoxID, message);
      } else {
        $(chat).append("<p class='chat stranger'><strong style='color:#2180D8;'>" + name + ": </strong>" +
            message + "</p></div>");
        $('#' + messageBoxID + " .chat-chats").append(chat);
        $('#' + messageBoxID).trigger("scrollResize");
        $(chat).emoticonize();
      }

    };
    this.myInlineMessage = function (messageBoxID, message) {
      console.log(messageBoxID);
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
          _changeChatStatusChanged(ChatButtonStatus.HANGOUT);
        } else {
          chatBox(selector, user, isStranger);
        }
        $('#remembereds li').removeClass('active');
        $(this).tab('show');
        $(this).bind('shown', function (e) {
          $(this).trigger("scrollResize");
        });
      }
      currentTab = selector;
    };

    var chatBox = function (selector, user, isStranger) {
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
        $("#" + selector + ' .chat-scroll').setScrollPane({
          scrollToY       :$("#" + selector + ' .chat-scroll').data('jsp') == null ? 10000 : $("#" + selector + ' .chat-scroll').data('jsp').getContentPositionY(),
          width           :12,
          height          :10,
          maintainPosition:false,
          outer           :true
        });
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
      chatOptions(selector, user, isStranger);
    };
    var chatOptions = function (selector, user, isStranger) {
      if (isStranger) {
        $('#' + selector + '  .remember').removeClass('remove').addClass('add').text('Remember')
      } else {
        _setPresence($('#' + selector + '  .buddy-status'), _presenceValue(user.pres));
        $('#' + selector + '  .remember').removeClass('add').addClass('remove').text('Forget')
      }
    };
  }

  var _INSTANCE = new MessageBox();

  $.getMessageBox = function () {
    return _INSTANCE;
  };
})(jQuery);
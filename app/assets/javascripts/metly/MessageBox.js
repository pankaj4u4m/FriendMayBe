//= require ./XmppUtils
(function ($) {
  function MessageBox() {
    var _notificationBox = null;
    var _isCommand = null;
    var _xmppRemoveUser = null;
    var _xmppAddUser = null;
    var _setPresence = null;
    var _presenceValue = null;
    var self = this;

    this.init = function(notificationBox, isCommand, xmppRemoveUser, xmppAddUser, setPresence, presenceValue){
      self.setNotificationBoxCallback(notificationBox);
      self.setIsCommandCallback(isCommand);
      self.setXmppRemoveUserCallback(xmppRemoveUser);
      self.setXmppAddUserCallback(xmppAddUser);
      self.setSetPresenceCallback(setPresence);
      self.setPresenceValueCallback(presenceValue);

      self.newMessageBox.call($("<a data-toggle='chat' class='roster-contact'  href='#notification'></a>"), 'notification');
    };
    this.setNotificationBoxCallback = function(notificationBox){
      console.log(notificationBox);
      _notificationBox = notificationBox;
    };
    this.setIsCommandCallback = function(isCommand){
      _isCommand = isCommand;
    };
    this.setXmppRemoveUserCallback = function(xmppRemoveUser){
      _xmppRemoveUser = xmppRemoveUser;
    };
    this.setXmppAddUserCallback = function(xmppAddUser){
      _xmppAddUser = xmppAddUser;
    };
    this.setSetPresenceCallback = function(setPresence){
      _setPresence = setPresence;
    };
    this.setPresenceValueCallback = function(presenceValue){
      _presenceValue = presenceValue;
    };

    this.eventMessage = function (messageBoxID, message) {
      $('#' + messageBoxID + ' .chat-chats').append(
          "<div class='chat-event'>-" + message + "</div>");
      $('#' + messageBoxID).trigger("scrollResize");
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
      console.log(self);
      if (command) {
        if (message == '\\c' && messageBoxID == Constants.SYSTEM_NODE) {
          $('#' + messageBoxID + "  div.chat-chats").empty();
        }
        console.log(self);
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
      if (selector == 'notification') {
        _notificationBox(selector);
      } else {
        chatBox(selector, user, isStranger);
      }

      $(this).tab('show');
      $(this).bind('shown', function (e) {
        $(this).trigger("scrollResize");
      });
    };

    this.authorizationPopup = function () {
      console.log("authorization popup");
      return true;
    };


    var chatBox = function (selector, user, isStranger) {
      user.id = user.id || Constants.SYSTEM_NODE;
      console.log("parameter node:" + selector + " jid:" + user.jid);
      if ($("#" + selector).length <= 0) {

        var chatbar = $("<div id='" + selector + "' class='tab-pane'></div>");
        chatbar.append("<div class='optionbar-fixed'>"
            + "<div class='buddy-status'> </div>"
            + "<div class='buddy-name'><a data-toggle='chat' href='#" + selector + "' style='color: #3366CC;'>" + (user.name || Constants.SYSTEM_NAME) + "</a> </div>"
            + "<div class='buddy-options'>"
            + "<button class='remember btn btn-primary " + (isStranger ? "add" : "remove") + "'>(isStranger?Remember:Forget)</button>"
            + "</div>"
            + "</div>");

        chatbar.append("<div class='chat-scroll'><div class='chat-chats'></div></div>");


        var messageBar = $("#messagebar");
        $(messageBar).append(chatbar);
        $("#" + selector + ' .chat-scroll').setScrollPane({
          scrollToY:$("#" + selector + ' .chat-scroll').data('jsp') == null ? 10000 : $("#" + selector + ' .chat-scroll').data('jsp').getContentPositionY(),
          width:12,
          height:10,
          maintainPosition:false,
          outer:true
        });
        $('#' + selector + ' button.remember').click(function () {
          console.log('clicked');
          if ($(this).hasClass('remove')) {
            _xmppRemoveUser();
          } else if ($(this).hasClass('add')) {
            _xmppAddUser();
          }
        })
      }
      _setPresence($('#' + selector + '  .buddy-status'), _presenceValue(user.pres));

      chatOptions(selector, isStranger);
    };
    var chatOptions = function (selector, isStranger) {
      if (isStranger) {
        $('#' + selector + '  .remember').removeClass('remove').addClass('add').text('Remember')
      } else {
        $('#' + selector + '  .remember').removeClass('add').addClass('remove').text('Forget')
      }
    };
  }
  var _INSTANCE = new MessageBox();

  $.getMessageBox = function(){
    return _INSTANCE;
  };
})(jQuery);
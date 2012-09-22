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

    this.Constructor = function (notification, xmppActivity, xmppCore, xmppUtils) {
      _notification = notification;
      _xmppActivity = xmppActivity;
      _xmppCore = xmppCore;
      _xmppUtils = xmppUtils;
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
        sendComposeMessage();
        if (code == 13) { //Enter keycode
          var msg = $(this).val().trim();
          if (msg && msg.length) {
            _xmppActivity.xmppSendMessage(msg);
          }

          $(this).val("");

          return false;
        }
        return true;
      });
      $("#stranger").click(function () {
        _xmppActivity.strangerChat();
      });
      $(document).bind('composing.chatstates', function(e, jid){
        var id = _xmppUtils.jidToId(jid);
        $('#' + id + ' .chat-chats .chat-temp-event').remove();
        $('#' + id + ' .chat-chats').append(
            "<div class='chat-temp-event'>-" + _xmppCore.getRosterName(jid) + " is Typing...</div>");
        $('#' + id).trigger("scrollResize");
//        setTimeout(function () {
//          $('#' + id + ' .chat-chats .chat-temp-event').remove();
//        }, 10000)
      });
      $(document).bind('paused.chatstates', function(e, jid){
        var id = _xmppUtils.jidToId(jid);
        $('#' + id + ' .chat-chats .chat-temp-event').remove();
        $('#' + id + ' .chat-chats').append(
            "<div class='chat-temp-event'>-" + _xmppCore.getRosterName(jid) + " has stopped Typing.</div>");
        $('#' + id).trigger("scrollResize");
        setTimeout(function () {
          $('#' + id + ' .chat-chats .chat-temp-event').fadeOut('slow', function() {
            this.remove();
          });
        }, 5000)
      })
    };
    var sendComposeMessage = function(){
      if(!isComposing && _xmppCore.getConnection()) {
        _xmppCore.getConnection().chatstates.sendComposing(_xmppCore.getCurrentUser().jid, 'chat');
        isComposing = true;
        setTimeout(function(){
          var t = new Date().getTime();
          if(( t - typingTime > 5000) && isComposing){
            _xmppCore.getConnection().chatstates.sendPaused(_xmppCore.getCurrentUser().jid, 'chat');
            isComposing = false;
          }
        }, 5000);
      }
      typingTime = dateTime.getTime();
    };
    var chatBox = function (selector, user, isRemembered) {
      user.id = user.id || Constants.SYSTEM_NODE;
      console.log("parameter node:" + selector + " jid:" + user.jid);
      if ($("#" + selector).length <= 0) {

        $('.optionbar-fixed').empty();
        $('.optionbar-fixed').append("<div class='buddy-status'> </div>"
            + "<div class='buddy-name'><a data-toggle='tab' href='#" + selector + "' style='color: #3366CC;'>"
            + (user.name || Constants.SYSTEM_NAME) + "</a> </div>"
            + "<div class='" + selector + " buddy-options'>"
            + "<button class='remember btn btn-primary " + (isRemembered ?  "remove": "add") + " "
            + (_xmppCore.getMy().isAnonymous? "disabled":"") + "'>" + (isRemembered?"Forget":"Remember") + "</button>"
            + "</div>");
        var chatbar = $("<div id='" + selector + "' class='tab-pane'></div>");

        chatbar.append("<div class='chat-scroll'><div class='chat-chats'></div></div>");


        var messageBar = $("#messagebar");
        $(messageBar).append(chatbar);
        $('#message-scroll').addClass('white');
        $('.optionbar-fixed button.remember').click(function (e) {
          e.preventDefault();
          if($(this).hasClass('disabled')){
            self.eventMessage(_xmppCore.getCurrentUser().node, "Can't remember in anonymous login");
            return;
          }
          if ($(this).hasClass('remove')) {
            _xmppCore.removeUser();
          } else if ($(this).hasClass('add')) {
            _xmppCore.addUser();
          }
        })
      }
      self.chatOptions(selector, _xmppUtils.presenceValue(user.pres), isRemembered);
    };
    this.chatOptions = function (selector, presence, isRemembered) {
      if (!isRemembered) {
        $('.' + selector + '  .remember').removeClass('remove').addClass('add').text('Remember')
      } else {
        _xmppUtils.setPresence($('#' + selector + '  .buddy-status'), presence);
        if(!Strophe.getNodeFromJid(_xmppCore.getCurrentUser()) == Constants.SYSTEM_NODE){
          $('.' + selector + '  .remember').removeClass('add').addClass('remove').text('Forget')
        } else {
          $('.' + selector + '  .remember').removeClass('remove').addClass('add').text('Remember')
        }
      }
    };
    this.eventMessage = function (messageBoxID, message) {
      if(!messageBoxID){
        return;
      }
      $('#' + messageBoxID + ' .chat-chats').append(
          "<div class='chat-event'> -" + message + "</div>");
      $('#' + messageBoxID).trigger("scrollResize");
    };

    this.strangerInlineMessage = function (messageBoxID, name, message) {
      if(!messageBoxID){
        return;
      }
      isComposing = false;
      $('#' + messageBoxID + ' .chat-chats .chat-temp-event').remove();
      var chat = $("<div class='chat'></div>");
      var command = _xmppUtils.isCommand(message);
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
      if(!messageBoxID){
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
      $(chat).emoticonize();
    };

    this.newMessageBox = function (selector, user, isRemembered) {
      if(!selector){
        return;
      }
      console.log(selector);
      if (selector == Constants.NOTIFICATION && currentTab == Constants.SYSTEM_NODE) {
        $('#myModal').modal();
      } else {
        if (selector == Constants.NOTIFICATION) {
          _notification.notificationBox(selector);
          self.changeChatStatusChanged(ChatButtonStatus.HANGOUT);
        } else {
          chatBox(selector, user, isRemembered);
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
      if(status == null || status == undefined){
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
        $("#stranger").text("Hang Out");
      }
    };
  }

  var _INSTANCE = new MessageBox();

  $.getMessageBox = function () {
    return _INSTANCE;
  };
})(jQuery);
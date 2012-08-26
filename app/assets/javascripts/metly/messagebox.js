(function ($) {

  function isCommand(msg){
    if(msg == '\\c') return 'Connecting to a Stranger..';
    if(msg == '\\d') return 'Disconnecting..';
    return false;
  }

  $.eventMessage = function (messageBoxID, message) {

    $('#' + messageBoxID + ' .chat-chats').append(
        "<div class='chat-event'>" + message + "</div>");
    $('#' + messageBoxID ).trigger("scrollResize");
  }

  $.strangerInlineMessage = function(messageBoxID, name, message){
    var chat = $("<div class='chat'></div>");
    var command = isCommand(message)
    if(command){
      $.eventMessage(messageBoxID, message);
    } else {
      $(chat).append("<p class='chat stranger'><strong style='color:#2180D8;'>" + name + ": </strong>" +
          message + "</p></div>")
      $('#' + messageBoxID + " .chat-chats").append(chat);
      $('#' + messageBoxID ).trigger("scrollResize");
    }

  }
  $.myInlineMessage = function (messageBoxID, message) {
    console.log(messageBoxID);
    var chat = $("<div class='chat'></div>");
    var command = isCommand(message)
    if(command){
      $.eventMessage(messageBoxID, command);
    } else {
      $(chat).append("<p class='chat me'><strong>You:</strong>" +
          message + "</p></div>")
    }
    $('#' + messageBoxID + " .chat-chats").append(chat);
    $('#' + messageBoxID ).trigger("scrollResize");
  }

  $.new_message_box = function (user, isStranger) {
    user.id = user.id || Constants.SYSTEM_NODE
    console.log("parameter node:" + user.id + " jid:" + user.jid);
    if ($("#" + user.id).length <= 0) {
      var chatbar = "<div id='" + user.id + "' class='tab-pane' style='height:100%;'>" +
          "<div class='chat-chats'></div></div>";

      var messageBar = $("#messagebar");
      $(messageBar).append(chatbar);
      $("#" + user.id).setScrollPane({
        scrollToY:$("#" + user.id).data('jsp') == null ? 10000 : $("#" + user.id).data('jsp').getContentPositionY(),
        width:12,
        height:10,
        maintainPosition:false
      });
    }

    $("#buddy-name").text(user.name || Constants.SYSTEM_NAME)
    $('#buddy-options').css('visibility', 'visible');
    if (isStranger) {
      $('#remember').removeClass('remove').addClass('add').text('Remember')
    } else {
      $('#remember').removeClass('add').addClass('remove').text('Forget')
    }

    $(this).tab('show');
    $(this).bind('shown', function (e) {
      $(this).trigger("scrollResize");
    });
  }

})(jQuery);
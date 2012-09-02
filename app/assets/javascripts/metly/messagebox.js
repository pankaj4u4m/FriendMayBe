//= require ./XmppUtils
(function ($) {
  $.eventMessage = function (messageBoxID, message) {
    $('#' + messageBoxID + ' .chat-chats').append(
        "<div class='chat-event'>-" + message + "</div>");
    $('#' + messageBoxID ).trigger("scrollResize");
  };

  $.strangerInlineMessage = function(messageBoxID, name, message){
    var event = $('#' + messageBoxID + ' > div:last-child');
    if(event.hasClass(".chat-event")){
      event.parent().remove();
    }
    var chat = $("<div class='chat'></div>");
    var command = $.XmppUtils.isCommand(message)
    if(command){
      $.eventMessage(messageBoxID, message);
    } else {
      $(chat).append("<p class='chat stranger'><strong style='color:#2180D8;'>" + name + ": </strong>" +
          message + "</p></div>")
      $('#' + messageBoxID + " .chat-chats").append(chat);
      $('#' + messageBoxID ).trigger("scrollResize");
      $(chat).emoticonize();
    }

  }
  $.myInlineMessage = function (messageBoxID, message) {
    console.log(messageBoxID);
    var chat = $("<div class='chat'></div>");
    var command = $.XmppUtils.isCommand(message)
    if(command){
      if(message == '\\c' && messageBoxID == Constants.SYSTEM_NODE){
        $('#' + messageBoxID + "  div.chat-chats").empty();
      }
      $.eventMessage(messageBoxID, command);
    } else {
      $(chat).append("<p class='chat me'><strong>You: </strong>" +
          message + "</p></div>")
    }
    $('#' + messageBoxID + " .chat-chats").append(chat);
    $('#' + messageBoxID ).trigger("scrollResize");
    $(chat).emoticonize();
  }

  $.new_message_box = function (selector, user, isStranger) {
    if(selector == 'notification'){
      $.notification_box(selector);
    } else {
      chat_box(selector, user, isStranger);
    }

    $(this).tab('show');
    $(this).bind('shown', function (e) {
      $(this).trigger("scrollResize");
    });
  }

  $.authorizationPopup = function(){
    console.log("authorization popup");
    return true;
  }


  var chat_box = function(selector, user, isStranger){
    user.id = user.id || Constants.SYSTEM_NODE
    console.log("parameter node:" + selector + " jid:" + user.jid);
    if ($("#" + selector).length <= 0) {

      var chatbar = $("<div id='" + selector + "' class='tab-pane'></div>");
      chatbar.append("<div class='optionbar-fixed'>"
          + "<div class='buddy-status'> </div>"
          + "<div class='buddy-name'><a data-toggle='chat' href='#"+selector + "' style='color: #3366CC;'>" + (user.name || Constants.SYSTEM_NAME) + "</a> </div>"
          + "<div class='buddy-options'>"
          + "<button class='remember btn btn-primary " + (isStranger? "add":"remove") + "'>(isStranger?Remember:Forget)</button>"
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
      $('#' + selector + ' button.remember').click(function(){
        console.log('clicked');
        if($(this).hasClass('remove')){
          $.xmppRemoveUser();
        } else if ($(this).hasClass('add')){
          $.xmppAddUser();
        }
      })
    }
    $.XmppUtils.setPresence($('#'+ selector + '  .buddy-status'), $.XmppUtils.presenceValue(user.pres));

    chat_options(selector, isStranger);
  }
  var chat_options = function(selector, isStranger){
    if (isStranger) {
      $('#'+ selector + '  .remember').removeClass('remove').addClass('add').text('Remember')
    } else {
      $('#'+ selector + '  .remember').removeClass('add').addClass('remove').text('Forget')
    }
  }
})(jQuery);
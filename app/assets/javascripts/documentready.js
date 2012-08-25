$(document).ready(function () {
  $('div.scrollable').setScrollPane({
    hideFocus:true
  });
  $('#search-scroll').setScrollPane({
    width:12
  });

  $("#chattypebox").keypress(function (e) {
    var code = (e.keyCode ? e.keyCode : e.which ? e.which : e.charCode);
    if (code == 13) { //Enter keycode
      var msg = $(this).val().trim();
      if (msg && msg.length) {
        var chat = "<div class=\"chat\"><p class='chat me'><strong>Pankaj:</strong>" +
            msg + "</p></div>"
        var currentTab = $(this).data('id');
        $(currentTab + " .chat-chats").append(chat);
        $.xmppSendMessage(msg);
      }

      $(this).val("");
      $(window).trigger("scrollResize");

      return false;
    }
    return true;
  });

  $("#stranger").click(function () {
    $.startChat();
  })

  $('#remember').click(function(){
    if($(this).hasClass('remove')){
      $.xmppRemoveUser();
    } else if ($(this).hasClass('add')){
      $.xmppAddUser();
    }
  })
//
//  $('#searchTerm').keypress(function(e){
//    var code = (e.keyCode ? e.keyCode : e.which ? e.which : e.charCode);
//    var search =  $(this).val().trim() + String.fromCharCode(code);
//    console.log(search);
//
//    var contacts = $('#remembereds li');
//    $.XmppUtils.searchContacts(contacts, search)
//  })

//    $('#chattab').bind('resize',function(){
//        $(this).width($(this).parent().width());
//    })
});
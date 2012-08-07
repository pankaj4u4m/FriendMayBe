
$(document).ready(function(){
  $('div.scrollable').setScrollPane({
    width: 9,
    hideFocus:true,
    autohide: $('div.scrollable').hasClass('autohide')
  });

    $("#chattypebox").keypress(function(e){
        var code = (e.keyCode ? e.keyCode : e.which);
        if(code == 13) { //Enter keycode
            var msg = $(this).val().trim();
            if(msg && msg.length){
                var chat = "<div class=\"message\"><p class='chat'><strong>Pankaj:</strong>" +
                    msg + "</p></div>"
                var currentTab = "#"+$("#current-user").val();
                $(currentTab +" .chat-message").append(chat);
                $.xmppSend(msg);
            }

            $(this).val("");
            $(window).trigger("scrollResize");

            return false;
        }
        return true;
    });

//    $('#chattab').bind('resize',function(){
//        $(this).width($(this).parent().width());
//    })
});
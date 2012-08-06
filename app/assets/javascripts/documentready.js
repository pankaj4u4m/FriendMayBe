
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
               // $(chat).width($('.tab-content').width());
                var currentTab = "#"+$("#current-user").val();
                $(currentTab+ ' .chat-message').append(chat);
                $.xmppSend(msg);
            }

            $(this).val("");
            //$(window).trigger("scrollResize");

            return false;
        }
        return true;
    });

    $(window).bind('resize',function(){
        $(".message").width($(".message").parent().width());
    });
/*  setInterval(function(){
      $.get('/remembereds', function(data){
          $('#remembereds ul').empty();
          var items = jQuery.parseJSON(data);
          $(items).each(function(i){
              $('#remembereds ul').append(' <li class=""><a data-toggle="tab" href="#U1">' + this.user_details.name +  '</a></li>')
          })

      })
  }, 3000);
  */
});
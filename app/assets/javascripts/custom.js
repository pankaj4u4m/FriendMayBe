
$(document).ready(function(){
  $('div.scrollable').setScrollPane({
    width: 9,
    hideFocus:true,
    autohide: $('div.scrollable').hasClass('autohide')
  });

  $.xmppConnect();

  $('.nav').each(function(){
    var currentTab, ul = $(this);
    $(this).find('a').each(function(){
      var a = $(this).bind('click',function(){
        if (currentTab) {
          ul.find('a.active').removeClass('active');
          $(currentTab).hide();
        }
        currentTab = $(this).addClass('active')
        .attr('href');
        var api = $(currentTab).data('jsp');

        $(currentTab).show().setScrollPane({
          scrollToY: api == null?10000:api.getContentPositionY(),
          hideFocus: true
        });
        return true;
      });
    });
  });

  $('#chattypebox').keypress(function(e){
    console.debug(e);
    var code = (e.keyCode ? e.keyCode : e.which);
    if(code == 13) { //Enter keycode
      var msg = $(this).val().trim();
      if(msg && msg.length){
        console.debug(msg);
        $('#chatmsg').append("<div class=\"message\"><p><strong>Pankaj:</strong>" +
          msg + "</p></div>");
        console.debug($('#chatmsg').html());
      }
      $(this).val("");
      $.post('')
      return false;
    }
    return true;
  });
  $('.message').each(function(){
    $(this).width($('.tab-content').width());
    $(window).bind('resize',function(){
      $(this).width($(this).parent().width());
    });
  })
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
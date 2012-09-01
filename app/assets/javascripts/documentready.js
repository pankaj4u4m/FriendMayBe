
$(document).ready(function () {
  $('div.scrollable').setScrollPane({
    hideFocus:true,
    autohide:true
  });
  $('#search-scroll').setScrollPane({
    width:12
  });

  $("#chattypebox").keypress(function (e) {
    var code = (e.keyCode ? e.keyCode : e.which ? e.which : e.charCode);
    if (code == 13) { //Enter keycode
      var msg = $(this).val().trim();
      if (msg && msg.length) {
        $.xmppSendMessage(msg);
      }

      $(this).val("");

      return false;
    }
    return true;
  });

  $("#stranger").click(function () {
    $.strangerChat();
  })

  $('#remember').click(function(){
    if($(this).hasClass('remove')){
      $.xmppRemoveUser();
    } else if ($(this).hasClass('add')){
      $.xmppAddUser();
    }
  })
  $('input[textholder], textarea[textholder]').placeholder();
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
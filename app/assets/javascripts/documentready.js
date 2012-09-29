/* Initialization */
var messageBox = $.getMessageBox();
var notification = $.getNotification();
var userLocation = $.getUserLocation();
var xmppActivity = $.getXmppActivity();
var xmppCore = $.getXmppCore();
var xmppOnMethods = $.getXmppOnMethods();
var xmppUtils = $.getXmppUtils();
var videoCall = $.getVideocall();

messageBox.Constructor(notification, xmppActivity, xmppCore, xmppUtils);

notification.Constructor(messageBox, xmppCore, xmppUtils);

xmppActivity.Constructor(messageBox, notification, userLocation, xmppCore, xmppOnMethods, xmppUtils);

xmppCore.Constructor(xmppOnMethods, xmppUtils, xmppActivity);

xmppOnMethods.Constructor(messageBox, notification, xmppCore, xmppUtils, videoCall);

videoCall.Constructor(xmppCore);
/* Initialization end */

$(document).ready(function () {
  notification.init();
  messageBox.init();
  videoCall.init();
  xmppOnMethods.init();

  var textArea = $('#feedback textarea');
  $('.feedback').click(function (e) {
    $('#feedback .modal-body').empty().append(textArea);
    $('#feedback').modal();
    e.preventDefault();
  });
  $('#feedback .send').click(function (e) {
    if (textArea.val().trim().length > 0) {
      var txt = textArea.val().trim();
      $('#feedback .modal-body').empty();
      $('#feedback .modal-body').append('<p>sending...<br/>' + txt + '</p>')
      $.get(Constants.FEEDBACK_URL, {feedback:txt}, function(){
        $('#feedback').modal('hide');
      });
    }
  });
  $(window).bind('resize',function(){
    var w = $('.loginbtn').width();
    if(w) {
      var mid = ($('.loginbtn').parent().width() - w)/2;
      $('.loginbtn').css('left', mid);
      $('.login-description').css('left', mid);
    }

  });
  $(window).trigger('resize');

  var title = $('title').html();

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
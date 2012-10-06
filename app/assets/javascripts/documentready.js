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

  var textArea = null;
  $('#logo').click(function(e){
    e.preventDefault();



    //TODO remove this this is only for experiment
  });
  $('.feedback').click(function (e) {
    var f = $('#feedbackModal');
    if(!f.length) {
      var b = MetlyTemplates.feedbackModal;
      $('body').append(b);

      textArea = $('#feedbackModal textarea');
      $('#feedbackModal .send').click(function (e1) {
        if (textArea.val().trim().length > 0) {
          $(this).text('Sending...');
          $(this).addClass('disabled');
          var txt = textArea.val().trim();
          textArea.val('');
          $('#feedbackModal .modal-body').empty();
          $('#feedbackModal .modal-body').append('<p>' + txt + '</p>')
          $.get(Constants.FEEDBACK_URL, {feedback:txt}, function(data){
            $('#feedbackModal').modal('hide');
            $(this).text('Send');
            $(this).removeClass('disabled');
          }, 'json');
        }
      });
      f = $('#feedbackModal');
    }
    $(f).find('.modal-body').empty().append(textArea);
    $(f).modal();
    e.preventDefault();
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
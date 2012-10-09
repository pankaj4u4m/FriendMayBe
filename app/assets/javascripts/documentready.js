/* Initialization */
var messageBox = $.getMessageBox();
var notification = $.getNotification();
var userLocation = $.getUserLocation();
var xmppActivity = $.getXmppActivity();
var xmppCore = $.getXmppCore();
var xmppOnMethods = $.getXmppOnMethods();
var xmppUtils = $.getXmppUtils();
var videoCall = $.getVideocall();
var appManager = $.getAppManager();
var playGame = $.getPlayGame();

appManager.Constructor(xmppCore);

messageBox.Constructor(notification, xmppActivity, xmppCore, xmppUtils, playGame);

notification.Constructor(messageBox, xmppCore, xmppUtils);

playGame.Constructor(appManager);

videoCall.Constructor(xmppCore, appManager);

xmppActivity.Constructor(messageBox, notification, userLocation, xmppCore, xmppOnMethods, xmppUtils);

xmppCore.Constructor(xmppOnMethods, xmppUtils, xmppActivity);

xmppOnMethods.Constructor(messageBox, notification, xmppCore, xmppUtils, videoCall);


/* Initialization end */

$(document).ready(function () {
  notification.init();
  messageBox.init();
  videoCall.init();
  xmppOnMethods.init();

  var textArea = null;
  $('#logo').click(function(e){
    e.preventDefault();

    playGame.loadAGame();
    //TODO remove this this is only for experiment
  });
  $('.feedback').click(function (e) {
    var f = $('#feedbackModal');
    if(!f.length) {
      var b = FriendmaybeTemplates.feedbackModal;
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
});
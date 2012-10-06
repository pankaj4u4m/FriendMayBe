(function ($) {
  function VideoCall(){
    var _xmppCore = null;
    var self = this;
    var player = new Object();
    this.Constructor = function (xmppCore) {
      _xmppCore = xmppCore;
    };
    this.init = function(){
      player.target = document.getElementById('video-sound-player');
      if(!player.target) {
        $('body').append(MetlyTemplates.videoCallReceivedSound);
        player.target = document.getElementById('video-sound-player');
      }
      $('#optionbar-fixed button.video').click(function(e){
        e.preventDefault();
        if($(this).hasClass('callend')){
          stopApp();
          $(this).removeClass('callend btn-danger').addClass('btn-primary');
          $(this).html('Video');
        } else {
          self.openVideo();
          $(this).removeClass('btn-primary').addClass('callend btn-danger');
          $(this).html('Hang Up');
        }
      });
      $(window).bind('userDisconnected', function(){
        stopApp();
        $('#optionbar-fixed button.video').removeClass('callend btn-danger').addClass('btn-primary');
        $('#optionbar-fixed button.video').html('Video');
      });

      player.repeat = true;
      player.play = function(){
        if(player.target) {
          player.target.SetVariable('method:stop', '');
          player.target.SetVariable('method:play', '');
          setTimeout(function(){
            player.target.SetVariable('method:stop', '');
            if(player.repeat) {
              player.play();
            }
          }, 3000);
        }
      };
      player.stop = function(){
        if(player.target) {
          player.target.SetVariable('method:stop', '');
          player.repeat = false;
        }
      };

    };
    this.videoRequest = function (message) {
      player.play();

      var prompt = $(message).find('body').text();
      var windowType = $(message).find("windowType").text();
      var firstParty = $(message).find('firstParty').text();
      var secondParty = $(message).find("secondParty").text();
      var sessionID = $(message).find("sessionID").text();

      var v = $('#videoModal');
      var accepted = false;
      if(!v.length){
        $('body').append(MetlyTemplates.videoModal);
        $('#videoModal-accept').click(function(e){
          accepted = true;
          player.stop();
          e.preventDefault();
          stopApp();
          openWindow(secondParty, firstParty, sessionID);
          $('#optionbar-fixed button.video').removeClass('btn-primary').addClass('callend btn-danger');
          $('#optionbar-fixed button.video').html('Hang Up');
        });
        $('#videoModal-reject').click(function(e) {
          player.stop();
          var msg = $msg({to:_xmppCore.getCurrentUser().jid, type:"chat"}).c("body", {xmlns:Strophe.NS.CLIENT}).t(prompt);
          var redfire = msg.up().c("redfire-reject", {xmlns:"http://redfire.4ng.net/xmlns/redfire-invite"});
          _xmppCore.getConnection().send(msg);
        });
        v = $('#videoModal');
      }
      $(v).find('.modal-header p').html(_xmppCore.getRosterName(_xmppCore.getCurrentUser().jid) + prompt);
      $(v).modal();
      setTimeout(function(){
        if(!accepted) {
          $('#videoModal-reject').trigger('click');
        }
      }, 30000);
    };
    this.rejectVideo = function(message) {
      var m = $(MetlyTemplates.alertMessage);
      $(m).find('span').html('User as rejected ur call');
      setTimeout(function(){
        $(m).alert('close');
      },10000);
      $('#messagebar-box').prepend(m);

      stopApp();
      $('#optionbar-fixed button.video').removeClass('callend btn-danger').addClass('btn-primary');
      $('#optionbar-fixed button.video').html('Video');
    };
    this.openVideo = function () {
      var firstParty = Math.random().toString(36).substr(2, 4);
      var secondParty = Math.random().toString(36).substr(2, 4);
      var sessionId = Math.random().toString(36).substr(2, 15);

      var title = "Video Call " + secondParty;

      _sendInvite(" is offering to share a video in this chat...", _xmppCore.getCurrentUser().jid, firstParty, secondParty, "_video", sessionId);
      openWindow(firstParty, secondParty, sessionId)
    };

    var openWindow = function( firstParty, secondParty, sessionId )
    {
      var content = $('#video-content');
      if(content){
        $(content).remove();
      }

      $('#video-container').width($('#messagebar-fixed').width()/2);

      var remote = $('<div class="video-content"><div id="remote-video" style="width: 100%;height: 100%"></div><div class="video-options"></div></div>');
      remote.height($('#video-container').height() - 5);
      $('#video-container').append(remote);



      $('#remote-video').html(MetlyTemplates.getFlashPlayer);


      $('#video-container').css({'right' : "-600px"});
      $('#video-container').animate({'right' : "0px"}, "slow", function(){
        $('#chat-app').width($('#chat-app').width() - $('#video-container').width());
      });
      $('#' + _xmppCore.getCurrentUser().id).trigger("scrollResize");
      startVideo(firstParty, secondParty, sessionId);
    };
    var _sendInvite = function (prompt, jid, firstParty, secondParty, windowType, sessionId) {
      var msg = $msg({to:jid, type:"chat"}).c("body", {xmlns:Strophe.NS.CLIENT}).t(prompt);
      var redfire = msg.up().c("redfire-invite", {xmlns:"http://redfire.4ng.net/xmlns/redfire-invite"});
      redfire.c("sessionID").t(sessionId).up();
      redfire.c("firstParty").t(firstParty).up();
      redfire.c("secondParty").t(secondParty).up();
      redfire.c("windowType").t(windowType).up();
      _xmppCore.getConnection().send(msg);
    };

    function stopApp()
    {
      var videoContent = $(".video-content");
      if (videoContent != null)
      {
        try {
          videoContent.windowCloseEvent();

        } catch (error) {}
        $(videoContent).remove();
      }

      $('#video-container').width(0);

      $('#chat-app').width('auto');
      $('#' + _xmppCore.getCurrentUser().id).trigger("scrollResize");
    }

    var startVideo = function(firstParty, secondParty, sessionId) {
      startRemote(firstParty, secondParty, sessionId);
    };

    var startRemote = function(firstParty, secondParty, sessionId) {
      var localUID	= firstParty;
      var remoteUID	= secondParty;
      //var rtmfpUrl	= getPageParameter('rtmfpUrl', 'rtmfp://p2p.rtmfp.net/e423fa356c187078552b994c-004820ca784f/');

      var connectionKey 		= sessionId;

//      var videoPicQuality		= '0';
//      var videoFps			= '30';
//      var videoBandwidth		= '256000';
//      var micSetRate			= '22';

      var swfVersionStr = "11.1.0";
      // To use express install, set to playerProductInstall.swf, otherwise the empty string.
      var xiSwfUrlStr = "";
      var flashvars = {
//        videoPicQuality : videoPicQuality,
//        videoFps : videoFps,
//        videoBandwidth: videoBandwidth,
//        micSetRate: micSetRate,
        appWidth:$('#remote-video').width() -10 ,
        appHeight:$('#remote-video').height() - 10,

        connectionKey: connectionKey,
        localUID:localUID,
        remoteUID:remoteUID
      };
      var params = {};
//      params.quality = "high";
//      params.bgcolor = "#333333";
      params.allowscriptaccess = "sameDomain";
      params.allowfullscreen = "true";
      var attributes = {};
      attributes.align = "middle";
      swfobject.embedSWF(
          "/res/VideoChat.swf", "remote-video",
          "100%", "100%",
          swfVersionStr, xiSwfUrlStr,
          flashvars, params, attributes);
      // JavaScript enabled so display the flashContent div in case it is not replaced with a swf object.
      swfobject.createCSS("#remote-video", "display:block;text-align:left;");

    };
  }
  var _INSTANCE = new VideoCall();

  $.getVideocall = function () {
    return _INSTANCE;
  };
})(jQuery);
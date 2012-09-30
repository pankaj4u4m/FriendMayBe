(function ($) {
  function VideoCall(){
    var _xmppCore = null;
    var self = this;

    var videoSoundPlayer = null;

    this.Constructor = function (xmppCore) {
      _xmppCore = xmppCore;
    };

    this.init = function(){
      videoSoundPlayer = document.getElementById('video-sound-player');
      if(!videoSoundPlayer) {
        $('body').append(MetlyTemplates.videoCallReceivedSound);
        videoSoundPlayer = document.getElementById('video-sound-player');
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
    };
    this.videoRequest = function (message) {
      videoSoundPlayer.SetVariable('method:stop', '');
      videoSoundPlayer.SetVariable('method:play', '');

      var prompt = $(message).find('body').text();
      var windowType = $(message).find("windowType").text();
      var firstParty = $(message).find('firstParty').text();
      var secondParty = $(message).find("secondParty").text();
      var sessionID = $(message).find("sessionID").text();

      var v = $('#videoModal');
      if(!v.length){
        $('body').append(MetlyTemplates.videoModal);
        $('#videoModal-accept').click(function(e){
          e.preventDefault();
          stopApp();
          openWindow(secondParty, firstParty, sessionID);
          $('#optionbar-fixed button.video').removeClass('btn-primary').addClass('callend btn-danger');
          $('#optionbar-fixed button.video').html('End Call');
        });
        $('#videoModal-reject').click(function(e) {
          videoSoundPlayer.SetVariable('method:stop', '');
          var msg = $msg({to:_xmppCore.getCurrentUser().jid, type:"chat"}).c("body", {xmlns:Strophe.NS.CLIENT}).t(prompt);
          var redfire = msg.up().c("redfire-reject", {xmlns:"http://redfire.4ng.net/xmlns/redfire-invite"});
          _xmppCore.getConnection().send(msg);
        });
        v = $('#videoModal');
      }
      $(v).find('.modal-header p').html(_xmppCore.getRosterName(_xmppCore.getCurrentUser().jid) + prompt);
      $(v).modal();
      setTimeout(function(){
        $('#videoModal-reject').trigger('click');
      }, 30000);
    };
    this.rejectVideo = function(message) {
      stopApp();
      $(this).removeClass('callend btn-danger').addClass('btn-primary');
      $(this).html('Video');
    };
    this.openVideo = function () {
      var firstParty = Math.random().toString(36).substr(2, 4);
      var secondParty = Math.random().toString(36).substr(2, 4);
      var sessionId = Math.random().toString(36).substr(2, 15);

      var title = "Video Call " + secondParty;

      _sendInvite(" is offering to share a video in this chat", _xmppCore.getCurrentUser().jid, firstParty, secondParty, "_video", sessionId);
      openWindow(firstParty, secondParty, sessionId)
    };
    var openWindow = function( firstParty, secondParty, sessionId )
    {
      var content = $('#video-content');
      if(content){
        $(content).remove();
      }
      $('#video-container').css({'width' : $('#messagebar-fixed').width()/2});
      $('#video-container').append($('<div class="video-content"><div id="remote-video" style="width: 100%;height: 100%"></div></div>').height($('#video-container').height()/2 - 5));
      $('#video-container').append($('<div class="video-content" style="margin-top: 10px"><div id="local-video" style="width: 100%; height: 100%"></div></div>').height($('#video-container').height()/2 - 5));

      $('#remote-video').html(MetlyTemplates.getFlashPlayer);
      $('#local-video').html(MetlyTemplates.getFlashPlayer);


      $('#chat-app').width($('#chat-app').width() - $('#video-container').width());
      $('#' + _xmppCore.getCurrentUser().id).trigger("scrollResize");
      startVideo(firstParty, secondParty, sessionId);
    };
    var _sendInvite = function (prompt, jid, firstParty, secondParty, windowType, sessionId) {
      var msg = $msg({to:jid, type:"chat"}).c("body", {xmlns:Strophe.NS.CLIENT}).t(prompt);
      var redfire = msg.up().c("redfire-invite", {xmlns:"http://redfire.4ng.net/xmlns/redfire-invite"});
      redfire.c("sessionID").t(sessionId);
      redfire.c("firstParty").t(firstParty);
      redfire.c("secondParty").t(secondParty);
      redfire.c("windowType").t(windowType);
      _xmppCore.getConnection().send(msg);
    };

    function stopApp()
    {
      var redfireVideo = $("#video-panel");
      if (redfireVideo != null)
      {
        try {
          redfireVideo.windowCloseEvent();

        } catch (error) {}
        $(redfireVideo).remove();
      }
      $('#video-container').width(0);
      $('#chat-app').width('auto');
      $('#' + _xmppCore.getCurrentUser().id).trigger("scrollResize");
    }

    var startVideo = function(firstParty, secondParty, sessionId) {
      startRemote(firstParty, secondParty, sessionId);
      startLocal();
    };

    var startRemote = function(firstParty, secondParty, sessionId) {
      var streamMe	= firstParty;
      var streamYou	= secondParty;
      var rtmpUrl 	= 'rtmp:/oflaDemo';
      //var rtmfpUrl	= getPageParameter('rtmfpUrl', 'rtmfp://p2p.rtmfp.net/e423fa356c187078552b994c-004820ca784f/');
      var rtmfpUrl	= '';
      var key 		= sessionId;

      var videoPicQuality		= '0';
      var videoFps			= '30';
      var videoBandwidth		= '256000';
      var micSetRate			= '22';

      var swfVersionStr = "12.1.0";
      // To use express install, set to playerProductInstall.swf, otherwise the empty string.
      var xiSwfUrlStr = "";
      var flashvars = {
        videoPicQuality : videoPicQuality,
        videoFps : videoFps,
        videoBandwidth: videoBandwidth,
        micSetRate: micSetRate,
        videoWidth:500,
        videoHeight:500,
        rtmpUrl:rtmpUrl,
        rtmfpUrl: rtmfpUrl,
        streamKey: key,
        myStreamId:'myStreamId',
        receiverStreamId:'receiverStreamId'
      };
      var params = {};
      params.quality = "high";
      params.bgcolor = "#333333";
      params.allowscriptaccess = "sameDomain";
      params.allowfullscreen = "true";
      var attributes = {};
      attributes.id = "VideoChat";
      attributes.name = "VideoChat";
      attributes.align = "middle";
      swfobject.embedSWF(
          "/res/VideoCall.swf", "remote-video",
          "100%", "100%",
          swfVersionStr, xiSwfUrlStr,
          flashvars, params, attributes);
      // JavaScript enabled so display the flashContent div in case it is not replaced with a swf object.
      swfobject.createCSS("#remote-video", "display:block;text-align:left;");
    };
    var startLocal = function() {
      var videoPicQuality		= '0';
      var videoFps			= '30';
      var videoBandwidth		= '256000';

      var swfVersionStr = "11.1.0";
      // To use express install, set to playerProductInstall.swf, otherwise the empty string.
      var xiSwfUrlStr = "";
      var flashvars = {
        videoPicQuality : videoPicQuality,
        videoFps : videoFps,
        videoBandwidth: videoBandwidth,
        videoWidth:500,
        videoHeight:500,
        localCamera: 'true'};

      var params = {};
      params.quality = "high";
      params.bgcolor = "#333333";
      params.allowscriptaccess = "sameDomain";
      params.allowfullscreen = "true";
      var attributes = {};
      attributes.id = "VideoChat";
      attributes.name = "VideoChat";
      attributes.align = "middle";
      swfobject.embedSWF(
          "/res/VideoCall.swf", "local-video",
          "100%", "100%",
          swfVersionStr, xiSwfUrlStr,
          flashvars, params, attributes);
      // JavaScript enabled so display the flashContent div in case it is not replaced with a swf object.
      swfobject.createCSS("#local-video", "display:block;text-align:left;");
    }
  }

  var _INSTANCE = new VideoCall();

  $.getVideocall = function () {
    return _INSTANCE;
  };
})(jQuery);
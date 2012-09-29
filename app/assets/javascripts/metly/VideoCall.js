(function ($) {
  function VideoCall(){
    var _xmppCore = null;
    var self = this;

    this.Constructor = function (xmppCore) {
      _xmppCore = xmppCore;
    };

    this.init = function(){
      $('.optionbar-fixed button.video').click(function(e){
        e.preventDefault();
        if($(this).hasClass('callend')){
          stopApp();
          $(this).removeClass('callend btn-danger').addClass('btn-primary');
          $(this).html('Video');
        } else {
          self.openVideo();
          $(this).removeClass('btn-primary').addClass('callend btn-danger');
          $(this).html('End Call');
        }
      });
    };
    this.videoRequest = function (message) {
      var prompt = $(message).find('prompt').text();
      var nickname = $(message).find("nickname").text();
      var width = $(message).find("width").text();
      var height = $(message).find("height").text();
      var url = $(message).find('body').text();
      var windowType = $(message).find("windowType").text();
      var roomType = $(message).find("roomType").text();

      var title = "Video call with " + nickname;

      Boxy.confirm(nickname + prompt, function () {
        stopApp();
        self.openVideo();
        $('.optionbar-fixed button.video').removeClass('btn-primary').addClass('callend btn-danger');
        $('.optionbar-fixed button.video').html('End Call');
      });
    };
    this.openVideo = function () {
      var firstParty = Math.random().toString(36).substr(2, 4);
      var secondParty = Math.random().toString(36).substr(2, 4);
      var sessionId = Math.random().toString(36).substr(2, 15);


      var url2 = Constants.VIDEO_URL;
      var title = "Video Call " + secondParty;

      var newUrl1 = url2 + "?key=" + sessionId + "&me=" + firstParty + "&you=" + secondParty;
      var newUrl2 = url2 + "?key=" + sessionId + "&you=" + firstParty + "&me=" + secondParty;

      _sendInvite(" is offering to share a video in this chat", _xmppCore.getCurrentUser().jid, newUrl2, "_video", sessionId);
      openWindow(title, firstParty, secondParty)
    };
    var openWindow = function( title, firstParty, secondParty)
    {
      var content = $('#video-content');
      if(content){
        $(content).remove();
      }
      $('#video-container').append($('<div id="video-panel" style="height: 100%; width: 100%"></div>'));
      $('#video-container').css({'width' : $('.messagebar-box').width()/2});
      $('.messagebar-box').width($('.messagebar-box').width() - $('#video-container').width() - 8);
      $('.chattext-bottom').width($('.chattext-bottom').width() - $('#video-container').width());
      $('#' + _xmppCore.getCurrentUser().id).trigger("scrollResize");
      start();
//      if (videoPanel != null) {
//        videoPanel.hide();
//      }
//      videoPanel = new Boxy(content, {title: title , show: true, draggable: true, unloadOnHide: true});
    };
    var _sendInvite = function (prompt, jid, url, windowType, sessionId) {
      var msg = $msg({to:jid, type:"chat"}).c("body", {xmlns:Strophe.NS.CLIENT}).t(url);
      var redfire = msg.up().c("redfire-invite", {xmlns:"http://redfire.4ng.net/xmlns/redfire-invite"});
      redfire.c("sessionID").t(sessionId);
      redfire.c("prompt").t(prompt);
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
      $('.messagebar-box').width($('.messagebar-fixed').width());
      $('.chattext-bottom').width($('.home-fixed').width());
      $('#' + _xmppCore.getCurrentUser().id).trigger("scrollResize");
    }

    function getParameter(string, parm, delim) {
      if (string.length == 0) {
        return '';
      }
      var sPos = string.indexOf(parm + "=");
      if (sPos == -1) {return '';}
      sPos = sPos + parm.length + 1;
      var ePos = string.indexOf(delim, sPos);
      if (ePos == -1) {
        ePos = string.length;
      }
      return unescape(string.substring(sPos, ePos));
    }

    var getPageParameter = function(parameterName, defaultValue) {

     return defaultValue;
    };
    var start = function(){
      var streamMe	= getPageParameter('me', 'ME');
      var streamYou	= getPageParameter('you', 'YOU')
      var rtmpUrl 	= getPageParameter('rtmpUrl', 'rtmp:/oflaDemo');
      //var rtmfpUrl	= getPageParameter('rtmfpUrl', 'rtmfp://p2p.rtmfp.net/e423fa356c187078552b994c-004820ca784f/');
      var rtmfpUrl	= getPageParameter('rtmfpUrl', '');
      var key 		= getPageParameter('key', 'KEY');

      var videoPicQuality		= getPageParameter('videoPicQuality', '0');
      var videoFps			= getPageParameter('videoFps', '30');
      var videoBandwidth		= getPageParameter('videoBandwidth', '256000');
      var micSetRate			= getPageParameter('micSetRate', '22');

      fo = new SWFObject("/res/video.swf", "video-content", "100%", "100%", "10");
      fo.addParam("swLiveConnect", "true");
      fo.addParam("name", "video");

      fo.addVariable("rtmpUrl", rtmpUrl);
      fo.addVariable("rtmfpUrl", rtmfpUrl);
      fo.addVariable("streamMe", streamMe);
      fo.addVariable("streamYou", streamYou);
      fo.addVariable("key", key);

      fo.addVariable("videoPicQuality", videoPicQuality);
      fo.addVariable("videoFps", videoFps);
      fo.addVariable("videoBandwidth", videoBandwidth);
      fo.addVariable("micSetRate", micSetRate);

      fo.write("video-panel");
    }
  }

  var _INSTANCE = new VideoCall();

  $.getVideocall = function () {
    return _INSTANCE;
  };
})(jQuery);
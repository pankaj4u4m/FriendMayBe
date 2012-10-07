Constants = {
  USER_LOCATION:'/location',
  BOSH_SERVICE:'/bosh',
  PRE_BINDING:'/login',
  PRE_BINDING_ANONYMOUS: '/anonymouslogin',
  NOTIFICATION_SERVICE: '/notification',
  FEEDBACK_URL: '/feedback',
  SYSTEM_NODE: 'friendmaybe',
  SYSTEM_NAME: 'Stranger',
  NOTIFICATION: 'notification',
  MAX_LONG:Math.pow(2, 63) - 1


};
ChatButtonStatus = {
  HANGOUT:0,
  CONNECTING:1,
  CONFIRM_DISCONNECT:2,
  DISCONNECT:3
};
MessageType = {
  RECEIVED:0,
  SENT:1
};
Action = {
  ADD:0,
  REPLACE:1
};
Commands = {
  CONNECT: '\\c',
  DISCONNECT: '\\d'
};

audioplayerListener = new Object();
audioplayerListener.onInit = function() { };
audioplayerListener.onUpdate = function(){};

FriendmaybeTemplates = {
  videoModal : ['<div style="display: none;" aria-hidden="true" aria-labelledby="myModalLabel" role="dialog" tabindex="-1" id="videoModal" class="modal">',
    '<div class="modal-header">',
    '<button aria-hidden="true" data-dismiss="modal" class="close" type="button">×</button>',
    '<span> User is calling...</span>',
    '</div>',
    '<div class="modal-footer">',
    '<button aria-hidden="true" data-dismiss="modal" class="btn" id="videoModal-reject">Reject</button>',
    '<button aria-hidden="true" data-dismiss="modal" class="btn btn-primary" id="videoModal-accept">Accept</a>',
    '</div>',
    '</div>'].join(''),

   notificationModal : ['<div style="display: none;" aria-hidden="true" aria-labelledby="myModalLabel" role="dialog" tabindex="-1" id="notificationModal" class="modal">',
  '<div class="modal-header">',
  '<button aria-hidden="true" data-dismiss="modal" class="close" type="button">×</button>',
  '<span> Are you sure to disconnect current user? </span>',
  '</div>',
  '<div class="modal-footer">',
  '<button aria-hidden="true" data-dismiss="modal" class="btn">No</button>',
  '<a href="#notification" data-toggle="tab" aria-hidden="true" data-dismiss="modal" class="btn btn-primary" id="notificationModal-yes">Yes</a>',
  '</div>',
  '</div>'].join(''),

  feedbackModal : ['<div style="display: none;" aria-hidden="true" aria-labelledby="feedbackLabel" role="dialog" tabindex="-1" id="feedbackModal" class="modal">',
    '<div class="modal-header">',
    '<button aria-hidden="true" data-dismiss="modal" class="close" type="button">×</button>',
    '<span>You can provide feedback/feature request/problems to us.</span>',
    '</div>',
    '<div class="modal-body">',
    '<textarea style="width: 100%; position: relative; right: 7px;"></textarea>',
    '</div>',
    '<div class="modal-footer">',
    '<button aria-hidden="true" data-dismiss="modal" class="btn">Cancel</button>',
    '<button class="btn send btn-primary" >Send</button>',
    '</div>',
    '</div>'].join(''),

  messageReceivedSound : ['<object id="chat-sound-player" type="application/x-shockwave-flash" data="/res/audioplayer.swf" width="0" height="0" >',
    '<param name="movie" value="/res/audioplayer.swf" /><param name="AllowScriptAccess" value="always" />',
    '<param name="FlashVars" value="listener=audioplayerListener&amp;mp3=/res/notification.mp3" />',
    '</object>'].join(''),

  videoCallReceivedSound : ['<object id="video-sound-player" type="application/x-shockwave-flash" data="/res/audioplayer.swf" width="0" height="0" >',
    '<param name="movie" value="/res/audioplayer.swf" /><param name="AllowScriptAccess" value="always" />',
    '<param name="FlashVars" value="listener=audioplayerListener&amp;mp3=/res/ringtone.mp3&amp;interval=1000" />',
    '</object>'].join(''),

  getFlashPlayer : ['<p class="getFlashPlayer"> To view this page ensure that Adobe Flash Player version 11.1.0 or greater is installed. <span></span></p>',
    '<script type="text/javascript">',
    'var pageHost = ((document.location.protocol == "https:") ? "https://" : "http://");',
    '$(".getFlashPlayer span").html("',
    '<a href=\'http://www.adobe.com/go/getflashplayer\' class=\'btn-link\'>',
    '<img src=\'"+ pageHost + "www.adobe.com/images/shared/download_buttons/get_flash_player.gif\' alt=\'Get Adobe Flash player\' />',
    '</a>',
    '" );',
    '</script>' ].join(''),
  alertMessage: ['<div class="alert fade in">',
    '<button class="close" data-dismiss="alert" type="button">×</button>',
    '<strong></strong>',
    '<span></span>',
    '</div>'].join('')
};



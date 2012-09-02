(function($){
  var getRememberRequest = function(user, isRead, isMenu){
    var style =  isMenu? "menu":"page";
    var notread = isRead? "":"notread";

    var li = $("<li></li>");

    var element = $("<div class='notification-item-" + style +  " " + notread + " '></div>");
    element.append("<div class='notification-buddy-" + style + " " +  user.status + "'</div>");
    element.append("<a  data-toggle='chat' href='#" + user.id + "' class='notification-user-" + style + " '>" + user.name + " </a>");
    var accept_btn = $("<button class='btn btn-primary notification-accept-bnt-" + style + " '>accept</button>");
    accept_btn.data("user", user);
    element.append(accept_btn);
    var reject_btn = $("<button class='btn btn-primary notification-reject-bnt-" + style + " '>reject</button>");
    reject_btn.data("user", user);
    element.append(reject_btn);
    li.append(element);
    return li;
  }
  var getMessageNotification = function(user, message, isRead, isMenu){
    var style =  isMenu? "menu":"page";
    var notread = isRead? "":"notread";

    var li = $("<li></li>");
    var element = $("<div class='notification-item-" + style +  " " + notread + " '>");
    element.append("<div class='notification-text-buddy-" + style + " " + user.status + "'</div>");
    element.append("<a data-toggle='chat' href='#" + user.id + "' class='notification-text-user-" + style + " '>" + user.name + " </a>");
    var txt = $("<div class=' notification-text-" + style + " '>" +  message + " </div>");
    txt.data("user", user);
    element.append(txt);
    li.append(element);
    return li;

  }
  $.initNotificationMenu = function(){
    $('.notification-list-menu .notification-scroll-menu').height($(window).height()-30);
    $('.notification-list-menu .notification-scroll-menu').setScrollPane({
      autohide:true
    });
  }
  $.menuNotifications = function(){
    $('.notification-list-menu .notification-contents').empty();
    for (var i = 0; i < 5; i++){
      $('.notification-list-menu .notification-contents').append(getMessageNotification({id:'pankaj', name:'pankaj',status:'offline'},"I love you <3", true, true));
      $('.notification-list-menu .notification-contents').append(getRememberRequest({id:'pankaj', name:'pankaj',status:'offline'}, true, true));
    }
    $('div.all-notification > a ').click(function(){
      $.new_message_box.call(this, 'notification');
    });
    $(window).trigger("scrollResize");
  }
  var pageNotifications = function(){
    $('#notification .notification-contents').empty();
    for (var i = 0; i < 5; i++){
      $('#notification .notification-contents').append(getMessageNotification({id:'pankaj', name:'pankaj',status:'offline'},"I love you <3", true, false));
      $('#notification .notification-contents').append(getRememberRequest({id:'pankaj', name:'pankaj',status:'offline'}, true, false));
    }
    $('#notification > a ').click(function(){
      $.new_message_box.call(this, 'notification');
    });
    $(window).trigger("scrollResize");
  }
  $.notification_box = function(selector){
    if ($("#" + selector).length <= 0) {
      var chatbar = $("<div id='" + selector + "' class='tab-pane'></div>");
      chatbar.append("<div class='optionbar-fixed'>"
          + "<div class='buddy-name'> <a data-toggle='chat' href='#"+selector + "' style='color: #3366CC;'> Notifications</a> </div>"
          + "</div>");

      chatbar.append("<div class='notification-scroll-page'><div class='notification-contents'></div></div>");

      var messageBar = $("#messagebar");
      $(messageBar).append(chatbar);
      $("#" + selector + ' .notification-scroll-page').setScrollPane({
        scrollToY:$("#" + selector + ' .notification-scroll-page').data('jsp') == null ? 0 : $("#" + selector + ' .notification-scroll-page').data('jsp').getContentPositionY(),
        width:12,
        height:10,
        maintainPosition:false,
        outer:true
      });
      $('div.optionbar-fixed a ').click(function(){
        $.new_message_box.call(this, 'notification');
      });
    }
    pageNotifications();
  }
})(jQuery);

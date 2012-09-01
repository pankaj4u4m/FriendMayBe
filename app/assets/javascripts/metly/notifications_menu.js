(function($){
  var notification = [];
  var getRememberRequest = function(user, isRead, isMenu){
    var style =  isMenu? "menu":"page";
    var notread = isRead? "":"notread";

    var btn = $("<button class=' " + user.id + "  btn btn-primary notification-accept-bnt " + style + " '>accept</button>");
    btn.data("user", user);
    var element = $("<div class='notification-item " + style +  " " + notread + " '>");
    element.append("<a href='" + user.id + "' class='notification-user " + style + " '>" + user.name + " </a>");
    element.append(btn);
    element.appendTo("<li></li>")
    return element;
  }
  var getMessageNotification = function(user, message, isRead, isMenu){
    var style =  isMenu? "menu":"page";
    var notread = isRead? "":"notread";

    var txt = $("<div class=' " + user.id + " notification-text " + style + " '>" +  message + " </div>");
    txt.data("user", user);
    var element = $("<div class='notification-item " + style +  " " + notread + " '>");
    element.append("<a href='" + user.id + "' class='notification-text-user " + style + " '>" + user.name + " </a>");
    element.append(txt);
    element.appendTo("<li></li>")
    return element;
  }
  $.initNotificationMenu = function(){
    $('.notification-contents').height($(window).height()-300);
    $('.notification-contents').setScrollPane({
      autohide:true
    });
  }
  $.populateNotificationContent = function(){
    $(notification).each(function(){
      $('.notification-contents').append(this);
    })
  }

  $.insertNotification = function(notification){
    notification.push(notification);
  }

})(jQuery);

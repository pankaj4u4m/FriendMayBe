(function ($) {

  function Notifications() {
    var _newMessageBox = null;
    var self = this;
    var messages = [];

    this.init = function(newMessageBox) {
      self.setNewMessageBox(newMessageBox);

      $('#notification-btn').click(function () {
        self.notificationMenu();
      });
      $('#all-notifications a').click(function(e){
        e.preventDefault();
        _newMessageBox.call(this, 'notification');
        $('#notification-btn').parent().removeClass('open');
      });
    };
    this.setNewMessageBox = function(newMessageBox){
      _newMessageBox = newMessageBox;
    };


    var _update_messages = function (item) {
      console.log(item);
      return false
    };

//    var getRememberRequest = function (user, isRead, isMenu) {
//      var style = isMenu ? "menu" : "page";
//      var notread = isRead ? "" : "notread";
//
//      var li = $("<li></li>");
//
//      var element = $("<div class='notification-item-" + style + " " + notread + " '></div>");
//      element.append("<div class='notification-buddy-" + style + " " + user.status + "'</div>");
//      element.append("<a  data-toggle='chat' href='#" + user.id + "' class='notification-user-" + style + " '>" + user.name + " </a>");
//      var accept_btn = $("<button class='btn btn-primary notification-accept-bnt-" + style + " '>accept</button>");
//      accept_btn.data("user", user);
//      element.append(accept_btn);
//      var reject_btn = $("<button class='btn btn-primary notification-reject-bnt-" + style + " '>reject</button>");
//      reject_btn.data("user", user);
//      element.append(reject_btn);
//      li.append(element);
//      return li;
//    };
    var getMessageNotification = function (message, isRead, isMenu) {
      var style = isMenu ? "menu" : "page";
      var notread = isRead ? "" : "notread";

      var li = $("<li id='message-" + message.sender + "></li>");
      var element = $("<div class='notification-item-" + style + " " + notread + " '>");
      element.append("<div class='notification-text-buddy-" + style + " " + message.status + "'</div>");
      element.append("<a data-toggle='chat' href='#" + message.id + "' class='notification-text-user-" + style + " '>" + message.name + " </a>");
      var txt = $("<div class=' notification-text-" + style + " '>" + message + " </div>");
      txt.data("user", message);
      element.append(txt);
      li.append(element);
      return li;

    };
    var populateNotifications = function () {
      var token = $('meta[name=csrf-token]').attr('content');
      var param = $('meta[name=csrf-param]').attr('content');
      var data = {};
      data[param] = token;

      $.ajax({
        type:'post',
        url:Constants.NOTIFICATION_SERVICE,
        dataType:'json',
        tryCount:0,
        retryLimit:3,
        success:attachNotifications,
        data:data,
        error:function (xhr, textStatus, errorThrown) {
          if (textStatus == 'timeout') {
            this.tryCount++;
            if (this.tryCount <= this.retryLimit) {
              //try again
              $.ajax(this);
              return;
            }
          }
          if (xhr.status == 404) {
            //handle error
          } else {
            //handle error
          }
          errorNoifications();
        }

      });
    };

    var attachNotifications = function (data) {
      console.log(data);
      messages.push();
      var msg = data['messages'];
      $(msg).each(function () {
        if (_update_messages(this)) {
          deleteMenuNotification(this);
        }

        var menu = getMessageNotification(this, true, true);
        var page = getMessageNotification(this, true, false);
        menuNotifications(menu);
        pageNotifications(page);
      });
    };
    var errorNoifications = function () {

    };

    var deleteMenuNotification = function (notic) {

    };

    var menuNotifications = function (menu) {
      $('.notification-list-menu .notification-contents').prepend(menu);

      $(menu).find('a').click(function () {
        _newMessageBox.call(this, 'notification');
      });
      $(window).trigger("scrollResize");
    };
    var pageNotifications = function (page) {
      $(page).find('a').click(function () {
        _newMessageBox.call(this, 'notification');
      });
      $(window).trigger("scrollResize");
    };
    this.notificationBox = function (selector) {
      if ($("#" + selector).length <= 0) {
        var chatbar = $("<div id='" + selector + "' class='tab-pane'></div>");
        chatbar.append("<div class='optionbar-fixed'>"
            + "<div class='buddy-name'> <a data-toggle='chat' href='#" + selector + "' style='color: #3366CC;'> Notifications</a> </div>"
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
        $('div.optionbar-fixed a ').click(function () {
          _newMessageBox.call(this, 'notification');
        });
      }
      populateNotifications();
    };
    this.notificationMenu = function () {
      $('.notification-list-menu .notification-scroll-menu').height($(window).height() - 30);
      $('.notification-list-menu .notification-scroll-menu').setScrollPane({
        autohide:true
      });
    };
  }

  var _INSTANCE = new Notifications();
  $.getNotifications = function () {
    return _INSTANCE;
  };
})(jQuery);

(function ($) {

  function Notifications() {
    var _messageBox = null;
    var _xmppCore = null;
    var _xmppUtils = null;

    var self = this;
    var inRequest = false;

    var count = 0;

    this.Constructor = function (messageBox, xmppCore, xmppUtils) {
      _messageBox = messageBox;
      _xmppCore = xmppCore;
      _xmppUtils = xmppUtils;
    };
    this.init = function () {
      $(window).bind('resize', function () {
        menuResize();
      });
      $('#notification-btn').bind('click resize', function () {
        count = 0;
        $('#notification-btn').text(0);
        $('#notification-btn').removeClass('btn-primary');
        $('#notification-btn').addClass('btn-inverse')
//        $('#notification-btn').css({'border':'1px solid #D7D7D7', 'font-weight':'normal'});
        menuResize();
      });
      $('#all-notifications a').click(function (e) {
        e.preventDefault();
        _messageBox.newMessageBox.call(this, Constants.NOTIFICATION);
        $('#notification-btn').parent().removeClass('open');
      });
      $('#modal-yes').click(function(e){
        e.preventDefault();
        _messageBox.newMessageBox.call(this, Constants.NOTIFICATION)
      });
      _messageBox.newMessageBox.call($("<a data-toggle='tab' class='roster-contact'  href='#" + Constants.NOTIFICATION + "'></a>"), Constants.NOTIFICATION);

    };
    var menuResize = function () {
      var mn = $(document).height() - 180;
      $('.notification-list-menu .notification-scroll-menu').height(mn);
      $('.notification-list-menu .notification-scroll-menu').setScrollPane({
        autohide        :true,
        maintainPosition:false
      });
    };

    var getRequestNotification = function (item, isRead, isMenu) {
      var style = isMenu ? "menu" : "page";
      var notread = isRead ? "" : "notread";

      var li = $("<li class='" + item.id + " request' ></li>");
      var element = $("<div class='notification-item-" + style + " " + notread + " '></div>");
      element.append("<div class='notification-buddy-" + style + " " + _xmppCore.getRosterStatus(item.jid) +  "'> </div>");

      var anchor = $("<a  data-toggle='tab' href='#" + item.id + "' class='notification-user-" + style + " '>" + item.name + " </a>");
      anchor.click(function () {
        var currentUser = _xmppCore.getCurrentUser();
        currentUser.name = item.name;
        currentUser.jid = item.jid;
        currentUser.node = Strophe.getNodeFromJid(currentUser.jid);
        currentUser.id = item.id;
        currentUser.pres = 'offline';
//            console.log(currentUser);
        _messageBox.newMessageBox.call(this, currentUser.id, currentUser, false);
        element.removeClass('notread');
      });
      element.append(anchor);

      var reject = $("<button class='btn notification-reject-bnt-" + style + " '>reject</button>");
      reject.click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        reject.addClass('disabled');
        _xmppCore.rejectRequest(item.jid, item.name);
        setTimeout(function(){
          li.remove();
        }, 500);
      });
      element.append(reject);

      var accept = $("<button class='btn btn-primary notification-accept-bnt-" + style + " '>accept</button>");
      accept.click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        _xmppCore.acceptRequest(item.jid, item.name);
        setTimeout(function(){
          li.remove();
        }, 500);
      });
      element.append(accept);

      li.append(element);
      return li;
    };
    var getMessageNotification = function (message, isRead, isMenu) {
      var style = isMenu ? "menu" : "page";
      var notread = isRead ? "" : "notread";

      var li = $("<li class='" + message.id + "'></li>");
      var element = $("<div class='notification-item-" + style + " " + notread + " '></div>");
      element.append("<div class='notification-text-buddy" + " " + _xmppCore.getRosterStatus(message.sender) + "'> </div>");

      var anchor = $("<a data-toggle='tab' href='#" + message.id + "' class='notification-text-user-" + style + " '>" +  message.name + " </a>");
      anchor.click(function () {
        var currentUser = _xmppCore.getCurrentUser();
        currentUser.name = message.name || _xmppCore.getRosterName(message.sender);
        currentUser.jid = message.sender;
        currentUser.node = Strophe.getNodeFromJid(currentUser.jid);
        currentUser.id = message.id;
        currentUser.pres = _xmppCore.getRosterStatus(message.sender);
        _messageBox.newMessageBox.call(this, currentUser.id, currentUser, _xmppCore.getMy().roster.findItem(currentUser.jid)?true:false);
        element.removeClass('notread');
      });
      element.append(anchor);

      if(message.type==MessageType.SENT){
        element.append("<div class='icon-share-alt'> </div>");
      }
      element.append("<div class=' notification-text-" + style + "  '>" + message.body + " </div>");
      li.append(element);
      return li;
    };

    var attachNotifications = function (data) {
      var msg = data['messages'] || [];
      var rec = data['requests'] || [];
      if (msg.length + rec.length > 0) {
        $(msg).each(function () {
          var pair = _xmppCore.addReplaceMessages(this.id, this.body, this.sender, this.receiver, this.sender_name, this.receiver_name);
          if (pair.action == Action.REPLACE) {
            $('.notification-list-menu .notification-contents > .' + pair.item.id).remove();
            $('#notification .notification-contents > .' + pair.item.id).remove();
          }
          var menu = getMessageNotification(pair.item, true, true);
          var page = getMessageNotification(pair.item, true, false);
          menuNotifications(menu, false);
          pageNotifications(page, false);
        });
        $(rec).each(function () {
          var pair = _xmppCore.addReplaceRequests(this.jid, this.name);
          if (pair.action == Action.REPLACE) {
            $('.notification-list-menu .notification-contents > .' + pair.item.id).remove();
            $('#notification .notification-contents > .' + pair.item.id).remove();
          }
          var menu = getRequestNotification(pair.item, true, true);
          var page = getRequestNotification(pair.item, true, false);
          menuNotifications(menu, false);
          pageNotifications(page, false);
        });
      } else {
        errorNoifications("No notifications");
      }
      waitCompleteMethod();
      inRequest = false;
    };
    var notificationBtn = function () {
      $('#notification-btn').text(count);
      $('#notification-btn').removeClass('btn-primary');
      $('#notification-btn').addClass('btn-inverse')
      $('#notification-btn').css({'border':'1px solid #D7D7D7', 'font-weight':'normal'});
      if (count > 0) {
        $('#notification-btn').addClass('btn-primary');
        $('#notification-btn').removeClass('btn-inverse')
        $('#notification-btn').css({'border':'0', 'font-weight':'bold'});
      }
    };
    var populateNotifications = function () {
      if (inRequest) {
        return;
      }
      waitStartMethod();
      inRequest = true;

      var token = $('meta[name=csrf-token]').attr('content');
      var param = $('meta[name=csrf-param]').attr('content');
      var data = {};
      data[param] = token;
      data['minMessageId'] = _xmppCore.getMinMessageId();
      $.ajax({
        type      :'post',
        url       :Constants.NOTIFICATION_SERVICE,
        dataType  :'json',
        tryCount  :0,
        retryLimit:3,
        success   :attachNotifications,
        data      :data,
        error     :function (xhr, textStatus, errorThrown) {
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
    var errorNoifications = function (error) {
      error = error || "something wrong happend";
      waitCompleteMethod();
      inRequest = false;
      menuNotifications('<li class="error-notification"> ' + error + '</li>', false);
      pageNotifications('<li class="error-notification"> ' + error + '</li>', false);
    };

    var waitCompleteMethod = function () {
      $('.notification-list-menu .notification-contents .error-notification').remove();
      $('#notification .notification-contents .error-notification').remove();
    };

    var waitStartMethod = function () {
      menuNotifications("<li class='error-notification'>please wait...</li>", false);
      pageNotifications("<li class='error-notification'>please wait...</li>", false);
    };

    var menuNotifications = function (menu, isLatest) {
      if (isLatest) {
        $('.notification-list-menu .notification-contents').prepend(menu);
      } else {
        $('.notification-list-menu .notification-contents').append(menu);
      }
      $(window).trigger("scrollResize");
    };
    var pageNotifications = function (page, isLatest) {
      if (isLatest) {
        $('#notification .notification-contents').prepend(page);
      } else {
        $('#notification .notification-contents').append(page);
      }
      $(window).trigger("scrollResize");
    };

    this.updateNotificationUserStatusName = function (id, name, status) {
      if(!id || !name){
        return;
      }
//      $('.' + id + '.request').remove();
      $('.' + id + ' .notification-buddy-menu').removeClass('offline').removeClass('away').removeClass('online').addClass(status);
      $('.' + id + ' .notification-buddy-page').removeClass('offline').removeClass('away').removeClass('online').addClass(status);
      $('.' + id + ' .notification-text-buddy').removeClass('offline').removeClass('away').removeClass('online').addClass(status);
      $('.' + id + ' .notification-user-page').text(name);
      $('.' + id + ' .notification-user-menu').text(name);
      $('.' + id + ' .notification-text-user-page').text(name);
      $('.' + id + ' .notification-text-user-menu').text(name);
    };
    this.attachOneMessageNotification = function (id, body, sender, receiver) {
      if(!id || !sender || _xmppUtils.isCommand(body)){
        return;
      }
      var pair = _xmppCore.addReplaceMessages(id, body, sender, receiver, _xmppCore.getRosterName(sender), _xmppCore.getRosterName(receiver));
      if (pair.action == Action.REPLACE) {
        $('.notification-list-menu .notification-contents > .' + pair.item.id).remove();
        $('#notification .notification-contents > .' + pair.item.id).remove();
      }
      waitCompleteMethod();
      var menu = getMessageNotification(pair.item, false, true);
      var page = getMessageNotification(pair.item, false, false);
      menuNotifications(menu, true);
      pageNotifications(page, true);
      if (_xmppCore.getCurrentUser().id != pair.item.id) {
        count++;
        notificationBtn();
      }
    };
    this.attachOneRequestNotification = function (jid, name) {
      if (!jid) return;
      name = name || jid;
      var pair = _xmppCore.addReplaceRequests(jid, name);
      if (pair.action == Action.REPLACE) {
        $('.notification-list-menu .notification-contents > .' + pair.item.id).remove();
        $('#notification .notification-contents > .' + pair.item.id).remove();
      }
      waitCompleteMethod();
      var menu = getRequestNotification(pair.item, false, true);
      var page = getRequestNotification(pair.item, false, false);
      menuNotifications(menu, true);
      pageNotifications(page, true);

      count++;
      notificationBtn();

    };

    this.notificationBox = function (selector) {

      if(!selector){
        return;
      }
      _xmppCore.setCurrentUser({});
      if ($("#" + selector).length <= 0) {

        var chatbar = $("<div id='" + selector + "' class='tab-pane'></div>");
        chatbar.append("<div class='notification-scroll-page'><div class='notification-contents'></div></div>");
        var messageBar = $("#messagebar");
        $(messageBar).append(chatbar);
        $('#message-scroll').addClass('white');
        $('div.optionbar-fixed a ').click(function (e) {
          e.preventDefault();
        });
        if(!_xmppCore.getMy().isAnonymous) {
          populateNotifications();
        } else {
          errorNoifications("No notifications");
        }
      }
      $('.optionbar-fixed .buddy-name a').attr('href', '#'+selector).html("Notifications");
      $('.optionbar-fixed .buddy-options').addClass('hidden');
      $('.optionbar-fixed .buddy-status').addClass('hidden');
    };
  }

  var _INSTANCE = new Notifications();
  $.getNotification = function () {
    return _INSTANCE;
  };
})(jQuery);

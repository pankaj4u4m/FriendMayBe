(function ($) {

  function Notifications() {
    var _newMessageBox = null;
    var _getRosterStatus = null;
    var _getRosterName = null;
    var _getMy = null;
    var _addReplaceMessage = null;
    var _getMinMessageId = null;
    var _getRequests = null;
    var _addReplaceRequests = null;
    var _acceptRequest = null;
    var _rejectRequest = null;
    var _getCurrentUser = null;

    var self = this;
    var inRequest = false;

    var count = 0;

    this.Constructor = function (newMessageBox, getMy, getRosterStatus, getRosterName, addReplaceMessage, getMinMessageId, getRequests, addReplaceRequests, acceptRequest, rejectRequest, getCurrentUser) {
      _newMessageBox = newMessageBox;
      _getMy = getMy;
      _getRosterStatus = getRosterStatus ;
      _getRosterName = getRosterName;
      _addReplaceMessage = addReplaceMessage;
      _getMinMessageId = getMinMessageId;
      _getRequests = getRequests;
      _addReplaceRequests = addReplaceRequests;
      _acceptRequest = acceptRequest;
      _rejectRequest = rejectRequest;
      _getCurrentUser = getCurrentUser;
    };
    this.init = function(){
      $(window).bind('resize', function () {
        _menuResize();
      });
      $('#notification-btn').bind('click resize', function () {
        _menuResize();
        count = 0;
        $('#notification-btn').text(0);
        $('#notification-btn').removeClass('btn-primary');
        $('#notification-btn').css({'border':'1px solid #D7D7D7', 'font-weight':'normal'});
      });
      $('#all-notifications a').click(function (e) {
        e.preventDefault();
        _newMessageBox.call(this, Constants.NOTIFICATION);
        $('#notification-btn').parent().removeClass('open');
      });
    }
    var _menuResize = function () {
      $('.notification-list-menu .notification-scroll-menu').height($(document).height() - 180);
      $('.notification-list-menu .notification-scroll-menu').setScrollPane({
        autohide        :true,
        maintainPosition:false
      });
    };

    var _getRequestNotification = function (item, isRead, isMenu) {
      var style = isMenu ? "menu" : "page";
      var notread = isRead ? "" : "notread";

      var li = $("<li class='" + item.id + "' ></li>");
      var element = $("<div class='notification-item-" + style + " " + notread + " '></div>");
      element.append("<div class='notification-buddy-" + style + " offline '</div>");

      var anchor = $("<a  data-toggle='tab' href='#" + item.id + "' class='notification-user-" + style + " '>" + item.name + " </a>");
      anchor.click(function () {
        _getCurrentUser().name = item.name;
        _getCurrentUser().jid = item.jid;
        _getCurrentUser().node = Strophe.getNodeFromJid(_getCurrentUser().jid);
        _getCurrentUser().id = item.id;
        _getCurrentUser().pres = 'offline';
//            console.log(currentUser);
        _newMessageBox.call(this, _getCurrentUser().id, _getCurrentUser(), true);
        $('#notification-btn').parent().removeClass('open');
      });
      element.append(anchor);

      var accept = $("<button class='btn btn-primary notification-accept-bnt-" + style + " '>accept</button>");
      accept.click(function () {
        _acceptRequest(item.jid, item.name);
      });
      element.append(accept);
      var reject = $("<button class='btn btn-primary notification-reject-bnt-" + style + " '>reject</button>");
      reject.click(function () {
        _rejectRequest(item.jid, item.name);
      });
      element.append(reject);
      li.append(element);
      return li;
    };
    var _getMessageNotification = function (message, isRead, isMenu) {
      var style = isMenu ? "menu" : "page";
      var notread = isRead ? "" : "notread";

      var li = $("<li class='" + message.id + "'></li>");
      var element = $("<div class='notification-item-" + style + " " + notread + " '></div>");
      element.append("<div class='notification-text-buddy-" + style + " " + _getRosterStatus(message.sender) + "' </div>");

      var anchor = $("<a data-toggle='tab' href='#" + message.id + "' class='notification-text-user-" + style + " '>" + _getRosterName(message.sender) + " </a>");
      anchor.click(function () {
        _getCurrentUser().name = _getRosterName(message.sender);
        _getCurrentUser().jid = message.sender;
        _getCurrentUser().node = Strophe.getNodeFromJid(_getCurrentUser().jid);
        _getCurrentUser().id = message.id;
        _getCurrentUser().pres = _getRosterStatus(message.sender);
        _newMessageBox.call(this, _getCurrentUser().id, _getCurrentUser(), false);
        $('#notification-btn').parent().removeClass('open');
      });
      element.append(anchor);

      element.append("<div class=' notification-text-" + style + " " + message.type + " '>" + message.body + " </div>");
      li.append(element);
      return li;
    };

    var _attachNotifications = function (data) {
      var msg = data['messages'] || [];
      var rec = data['requests'] || [];
      count = msg.length + rec.length;
      if (msg.length + rec.length > 0) {
        $(msg).each(function () {
          var pair = _addReplaceMessage(this.id, this.body, this.sender, this.receiver);
          if (pair.action == Action.REPLACE) {
            $('.notification-list-menu .notification-contents > .' + pair.item.id).remove();
            $('#notification .notification-contents > .' + pair.item.id).remove();
            --count;
          }
          var menu = _getMessageNotification(pair.item, true, true);
          var page = _getMessageNotification(pair.item, true, false);
          _menuNotifications(menu, false);
          _pageNotifications(page, false);
        });
        $(rec).each(function () {
          var pair = _addReplaceRequests(this.jid, this.name);
          if (pair.action == Action.REPLACE) {
            $('.notification-list-menu .notification-contents > .' + pair.item.id).remove();
            $('#notification .notification-contents > .' + pair.item.id).remove();
          }
          var menu = _getRequestNotification(pair.item, true, true);
          var page = _getRequestNotification(pair.item, true, false);
          _menuNotifications(menu, false);
          _pageNotifications(page, false);
        });
      }
      _notificationBtn();
      _waitCompleteMethod();
      inRequest = false;
    };
    var _notificationBtn = function () {
      $('#notification-btn').text(count);
      $('#notification-btn').removeClass('btn-primary');
      $('#notification-btn').css({'border':'1px solid #D7D7D7', 'font-weight':'normal'});
      if (count > 0) {
        $('#notification-btn').addClass('btn-primary');
        $('#notification-btn').css({'border':'0', 'font-weight':'bold'});
      }
    };
    var _populateNotifications = function () {
      if (inRequest) {
        return;
      }
      _waitStartMethod();
      inRequest = true;

      var token = $('meta[name=csrf-token]').attr('content');
      var param = $('meta[name=csrf-param]').attr('content');
      var data = {};
      data[param] = token;
      data['minMessageId'] = _getMinMessageId();
      $.ajax({
        type      :'post',
        url       :Constants.NOTIFICATION_SERVICE,
        dataType  :'json',
        tryCount  :0,
        retryLimit:3,
        success   :_attachNotifications,
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
    var errorNoifications = function () {
      _waitCompleteMethod();
      inRequest = false;
      _menuNotifications('<li class="error-notification"> something wrong happend</li>', false);
      _pageNotifications('<li class="error-notification"> something wrong happend</li>', false);
    };

    var _waitCompleteMethod = function () {
      $('.notification-list-menu .notification-contents .error-notification').remove();
      $('#notification .notification-contents .error-notification').remove();
    };

    var _waitStartMethod = function () {
      _menuNotifications("<li class='error-notification'>please wait...</li>", false);
      _pageNotifications("<li class='error-notification'>please wait...</li>", false);
    };

    var _menuNotifications = function (menu, isLatest) {
      if (isLatest) {
        $('.notification-list-menu .notification-contents').prepend(menu);
      } else {
        $('.notification-list-menu .notification-contents').append(menu);
      }
      $(window).trigger("scrollResize");
    };
    var _pageNotifications = function (page, isLatest) {
      if (isLatest) {
        $('#notification .notification-contents').prepend(page);
      } else {
        $('#notification .notification-contents').append(page);
      }
      $(window).trigger("scrollResize");
    };

    this.attachOneMessageNotification = function (id, body, sender, receiver) {
      var pair = _addReplaceMessage(id, body, sender, receiver);
      if (pair.action == Action.REPLACE) {
        $('.notification-list-menu .notification-contents > .' + pair.item.sender).remove();
        $('#notification .notification-contents > .' + pair.item.sender).remove();
      }
      var menu = _getMessageNotification(pair.item, true, true);
      var page = _getMessageNotification(pair.item, true, false);
      _menuNotifications(menu, true);
      _pageNotifications(page, true);
      _notificationBtn();
    };
    this.attachOneRequestNotification = function (jid, name) {
      var pair = _addReplaceRequests(jid, name);
      if (pair.action == Action.REPLACE) {
        $('.notification-list-menu .notification-contents > .' + pair.item.jid).remove();
        $('#notification .notification-contents > .' + pair.item.jid).remove();
      }
      var menu = _getRequestNotification(pair.item, true, true);
      var page = _getRequestNotification(pair.item, true, false);
      _menuNotifications(menu, true);
      _pageNotifications(page, true);
      count++;
      _notificationBtn();
    };

    this.notificationBox = function (selector) {
      if ($("#" + selector).length <= 0) {
        var chatbar = $("<div id='" + selector + "' class='tab-pane'></div>");
        chatbar.append("<div class='optionbar-fixed'>"
            + "<div class='buddy-name'> <a data-toggle='tab' href='#" + selector + "' style='color: #3366CC;'> Notifications</a> </div>"
            + "</div>");

        chatbar.append("<div class='notification-scroll-page'><div class='notification-contents'></div></div>");

        var messageBar = $("#messagebar");
        $(messageBar).append(chatbar);
        $("#" + selector + ' .notification-scroll-page').setScrollPane({
          scrollToY       :$("#" + selector + ' .notification-scroll-page').data('jsp') == null ? 0 : $("#" + selector + ' .notification-scroll-page').data('jsp').getContentPositionY(),
          width           :12,
          height          :10,
          maintainPosition:false,
          outer           :true
        });
        $('div.optionbar-fixed a ').click(function (e) {
          e.preventDefault();
        });
        _populateNotifications();
      }
    };
  }

  var _INSTANCE = new Notifications();
  $.getNotifications = function () {
    return _INSTANCE;
  };
})(jQuery);

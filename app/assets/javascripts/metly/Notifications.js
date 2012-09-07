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

    var self = this;

    var inRequest = false;
    var count = 0;

    this.init = function (newMessageBox, getMy, getRosterStatus, getRosterName, addReplaceMessage, getMinMessageId, getRequests, addReplaceRequests,
                          acceptRequest, rejectRequest) {
      self.setNewMessageBox(newMessageBox);
      self.setGetMy(getMy);
      self.setGetRosterStatus(getRosterStatus);
      self.setGetRosterName(getRosterName);
      self.setAddReplaceMessage(addReplaceMessage);
      self.setGetMinMessageId(getMinMessageId);
      self.setGetRequests(getRequests);
      self.setAddReplaceRequests(addReplaceRequests);
      self.setAcceptRequest(acceptRequest);
      self.setRejectRequest(rejectRequest);

      $('#notification-btn').click(function () {
        if(!$('#notification-btn').parent().hasClass('open')){
          $('.notification-list-menu .notification-scroll-menu').height($(document).height());
          $('.notification-list-menu .notification-scroll-menu').setScrollPane({
            autohide:true,
            maintainPosition:false
          });
          _populateNotifications();
          $(window).trigger("scrollResize");
        }
        count = 0;
        $('#notification-btn').text(0);
        $('#notification-btn').removeClass('btn-primary');
        $('#notification-btn').css({'border':'1px solid #D7D7D7', 'font-weight':'normal'});
      });
      $('#all-notifications a').click(function (e) {
        e.preventDefault();
        _newMessageBox.call(this, 'notification');
        $('#notification-btn').parent().removeClass('open');
      });
    };

    this.setNewMessageBox = function (newMessageBox) {
      _newMessageBox = newMessageBox;
    };
    this.setGetMy = function (getMy) {
      _getMy = getMy;
    };
    this.setGetRosterStatus = function (getRosterStatus) {
      _getRosterStatus = getRosterStatus;
    };
    this.setGetRosterName = function (getRosterName) {
      _getRosterName = getRosterName;
    };
    this.setAddReplaceMessage = function (addMessage) {
      _addReplaceMessage = addMessage;
    };
    this.setGetMinMessageId = function (getMinMessageId) {
      _getMinMessageId = getMinMessageId;
    };
    this.setGetRequests = function (getRequests) {
      _getRequests = getRequests;
    };
    this.setAddReplaceRequests = function (addRequests) {
      _addReplaceRequests = addRequests;
    };
    this.setAcceptRequest = function(acceptRequest){
      _acceptRequest = acceptRequest;
    };
    this.setRejectRequest = function(rejectRequest){
      _rejectRequest = rejectRequest;
    };
    var _getRequestNotification = function (item, isRead, isMenu) {
      var style = isMenu ? "menu" : "page";
      var notread = isRead ? "" : "notread";

      var li = $("<li class='" + item.jid + "' ></li>");
      var element = $("<div class='notification-item-" + style + " " + notread + " '></div>");
      element.append("<div class='notification-buddy-" + style + " offline '</div>");
      element.append("<a  data-toggle='tab' href='#" + jid + "' class='notification-user-" + style + " '>" + item.name + " </a>");
      var accept = $("<button class='btn btn-primary notification-accept-bnt-" + style + " '>accept</button>");
      accept.click(function(){
        _acceptRequest(item.jid, item.name);
      });
      element.append(accept);
      var reject = $("<button class='btn btn-primary notification-reject-bnt-" + style + " '>reject</button>");
      reject.click(function(){
        _rejectRequest(item.jid, item.name);
      });
      element.append(reject);
      li.append(element);
      return li;
    };
    var _getMessageNotification = function (message, isRead, isMenu) {
      var style = isMenu ? "menu" : "page";
      var notread = isRead ? "" : "notread";

      var li = $("<li class='" + message.sender + "'></li>");
      var element = $("<div class='notification-item-" + style + " " + notread + " '></div>");
      element.append("<div class='notification-text-buddy-" + style + " " + _getRosterStatus(message.sender) + "' </div>");
      element.append("<a data-toggle='tab' href='#" + message.sender + "' class='notification-text-user-" + style + " '>" + _getRosterName(message.sender) + " </a>");
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
            $('.notification-list-menu .notification-contents > .' + pair.item.sender).remove();
            $('#notification .notification-contents > .' + pair.item.sender).remove();
          }
          var menu = _getMessageNotification(pair.item, true, true);
          var page = _getMessageNotification(pair.item, true, false);
          _menuNotifications(menu, false);
          _pageNotifications(page, false);
        });
        $(rec).each(function () {
          var pair = _addReplaceRequests(this.jid, this.name);
          if (pair.action == Action.REPLACE) {
            $('.notification-list-menu .notification-contents > .' + pair.item.jid).remove();
            $('#notification .notification-contents > .' + pair.item.jid).remove();
          }
          var menu = _getRequestNotification(pair.item, true, true);
          var page = _getRequestNotification(pair.item, true, false);
          _menuNotifications(menu, false);
          _pageNotifications(page, false);
        });
      }
      _notificationBtn();
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
      inRequest = true;

      var token = $('meta[name=csrf-token]').attr('content');
      var param = $('meta[name=csrf-param]').attr('content');
      var data = {};
      data[param] = token;
      data['minMessageId'] = _getMinMessageId();
      console.log(_getMinMessageId());
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
      _menuNotifications('<li> something wrong happend</li>', false);
      _pageNotifications('<li> something wrong happend</li>', false);
      inRequest = false;
    };

    var _menuNotifications = function (menu, isLatest) {
      if (isLatest) {
        $('.notification-list-menu .notification-contents').prepend(menu);
      } else {
        $('.notification-list-menu .notification-contents').append(menu);
      }

      $(menu).find('a').click(function () {
        _newMessageBox.call(this, Constants.NOTIFICATION);
      });
      $(window).trigger("scrollResize");
    };
    var _pageNotifications = function (page, isLatest) {
      if (isLatest) {
        $('#notification .notification-contents').prepend(page);
      } else {
        $('#notification .notification-contents').append(page);
      }
      $(page).find('a').click(function () {
        _newMessageBox.call(this, Constants.NOTIFICATION);
      });
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
        $('div.optionbar-fixed a ').click(function () {
          _newMessageBox.call(this, Constants.NOTIFICATION);
        });
      }
      _populateNotifications();
    };
  }

  var _INSTANCE = new Notifications();
  $.getNotifications = function () {
    return _INSTANCE;
  };
})(jQuery);

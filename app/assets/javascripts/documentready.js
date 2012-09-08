
/* Initialization */
var messageBox = $.getMessageBox();
var notifications = $.getNotifications();
var userLocation = $.getUserLocation();
var xmppActivity = $.getXmppActivity();
var xmppCore = $.getXmppCore();
var xmppOnMethods = $.getXmppOnMethods();
var xmppUtils = $.getXmppUtils();

messageBox.Constructor(notifications.notificationBox, xmppUtils.isCommand, xmppActivity.xmppRemoveUser,
    xmppActivity.xmppAddUser, xmppUtils.setPresence, xmppUtils.presenceValue, xmppActivity.changeChatStatusChanged);

notifications.Constructor(messageBox.newMessageBox, xmppCore.getMy, xmppCore.getRosterStatus, xmppCore.getRosterName,
    xmppCore.addReplaceMessages, xmppCore.getMinMessageId, xmppCore.getRequests, xmppCore.addReplaceRequests,
    xmppCore.acceptRequest, xmppCore.rejectRequest, xmppCore.getCurrentUser);

xmppActivity.Constructor(xmppCore.isAlive, xmppCore.getCurrentUser, xmppCore.setCurrentUser, xmppCore.getConnection,
    xmppCore.setConnection, xmppUtils.jidToId, xmppCore.getMy, messageBox.myInlineMessage, xmppActivity.xmppSendMessage,
    messageBox.newMessageBox, xmppOnMethods.onRosterRemoved, xmppOnMethods.onRosterAdded, messageBox.eventMessage,
    userLocation.setUserLocation, xmppOnMethods.onConnect);

xmppCore.Constructor(xmppUtils.rosterStatus, xmppUtils.jidToId);

xmppOnMethods.Constructor(xmppCore.getConnection, xmppCore.getMy, xmppCore.setAlive, notifications.attachOneRequestNotification,
    xmppUtils.jidToId, xmppCore.getCurrentUser, messageBox.eventMessage, xmppActivity.changeChatStatusChanged,
    messageBox.strangerInlineMessage,xmppUtils.updateContact, xmppUtils.getRosterElement, xmppUtils.presenceValue,
    xmppUtils.rosterStatus, messageBox.newMessageBox);

/* Initialization end */

$(document).ready(function () {
  $('div.scrollable').setScrollPane({
    hideFocus:true,
    autohide:true
  });
  $('#search-scroll').setScrollPane({
    width:12
  });

  $("#chattypebox").keypress(function (e) {
    var code = (e.keyCode ? e.keyCode : e.which ? e.which : e.charCode);
    if (code == 13) { //Enter keycode
      var msg = $(this).val().trim();
      if (msg && msg.length) {
        xmppActivity.xmppSendMessage(msg);
      }

      $(this).val("");

      return false;
    }
    return true;
  });

  $("#stranger").click(function () {
    xmppActivity.strangerChat();
  });
  notifications.init();
  messageBox.init();
//
//  $('#searchTerm').keypress(function(e){
//    var code = (e.keyCode ? e.keyCode : e.which ? e.which : e.charCode);
//    var search =  $(this).val().trim() + String.fromCharCode(code);
//    console.log(search);
//
//    var contacts = $('#remembereds li');
//    $.XmppUtils.searchContacts(contacts, search)
//  })

//    $('#chattab').bind('resize',function(){
//        $(this).width($(this).parent().width());
//    })
});
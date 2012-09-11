
/* Initialization */
var messageBox = $.getMessageBox();
var notification = $.getNotification();
var userLocation = $.getUserLocation();
var xmppActivity = $.getXmppActivity();
var xmppCore = $.getXmppCore();
var xmppOnMethods = $.getXmppOnMethods();
var xmppUtils = $.getXmppUtils();

messageBox.Constructor(notification, xmppActivity, xmppCore, xmppUtils);

notification.Constructor(messageBox, xmppCore);

xmppActivity.Constructor(messageBox, notification, userLocation, xmppCore, xmppOnMethods, xmppUtils);

xmppCore.Constructor(xmppOnMethods, xmppUtils);

xmppOnMethods.Constructor(messageBox, notification, xmppCore, xmppUtils);

/* Initialization end */

$(document).ready(function () {
  notification.init();
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
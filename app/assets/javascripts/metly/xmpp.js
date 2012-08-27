//= require ./constants
//= require ./scrollbar
//= require ./XmppUtils
(function ($) {
  var currentUser = {
    node:null,
    jid:null,
    status:null,
    id:null
  }
  var my = {
    node:null,
    domain: null,
    resource: null,
    jid:null,
    roster:null
  }
  var connection = null,
      isAlive = false,
      XmppOnFunctions = {
        onConnect:function (status) {
          isAlive = false;
          if (status == Strophe.Status.CONNECTED || status === Strophe.Status.ATTACHED) {
            console.debug('Strophe is attached.');
            connection.addHandler(XmppOnFunctions.onMessage, null, 'message', "chat");
            // Xmpp.connection.addHandler(Xmpp.onRosterChange, "jabber:iq:roster", "iq", "set");
//          connection.addHandler(Xmpp.onPresence, null, "presence");

            connection.send($pres().tree());
            my.roster = connection.roster;
            my.roster.registerCallback(XmppOnFunctions.onPresence)
            my.roster.get(XmppOnFunctions.onRosterReceive);

            isAlive = true;
          }
        },
        onMessage:function (message) {

          var full_jid = $(message).attr('from');
          var jid = Strophe.getBareJidFromJid(full_jid);
          var id = $.XmppUtils.jidToId(jid);

          if(!my.roster.findItem(Strophe.getBareJidFromJid(jid)) && currentUser.jid != full_jid){
            return true;
          }
          console.log(message);
          var composing = $(message).find('composing');
          if (composing.length > 0) {
            $.eventMessage(id, Strophe.getNodeFromJid(jid) + " is typing...");
            return true;
          }

          var body = $(message).find("html > body");

          if (body.length === 0) {
            body = $(message).find('body');
            if (body.length > 0) {
              body = body.text()
            } else {
              body = null;
            }
          } else {
            body = body.contents();

            var span = $("<span></span>");
            body.each(function () {
              if (document.importNode) {
                $(document.importNode(this, true)).appendTo(span);
              } else {
                // IE workaround
                span.append(this.xml);
              }
            });
            body = span;
          }
          if (body) {
            // remove notifications since user is now active
            $('#' + id + ' .chat-footer').empty();

            $.strangerInlineMessage(id, currentUser.name, body);
          }
          return true;
        },

        onPresence:function (list, item) {
          if (item) {
            var contacts = $('#remembereds li');
            if (contacts.length > 0) {
              $.XmppUtils.updateContact(contacts, item);
            } else {
              var element = $.XmppUtils.getRosterElement(item);
              $('#remembereds ul').append(element);
              XmppOnFunctions.contactEventBind(element);
            }
          } else {
            XmppOnFunctions.onRosterReceive(list);
          }
          return true;
        },
        onRosterReceive:function (data) {
//          console.log(data);
          data.sort(function (a, b) {
            var r = $.XmppUtils.presenceValue($.XmppUtils.rosterStatus(b.resources)) - $.XmppUtils.presenceValue($.XmppUtils.rosterStatus(a.resources));
            if (r == 0) {
              return (a.name || a.jid).localeCompare((b.name || b.jid));
            }

            return r;
          })
          $('#remembereds ul').empty();
          $(data).each(function () {
//            if(Strophe.getDomainFromJid(this.jid) == domain){
            var element = $.XmppUtils.getRosterElement(this);
            $('#remembereds ul').append(element);
//            }
          });
          XmppOnFunctions.contactEventBind($("#remembereds a"));
          return true;
        },
        onRosterRemoved:function (stanza) {
          $('#remember').removeClass('remove').addClass('add').text('Remember');
          my.roster.unsubscribe(currentUser.jid)
          XmppOnFunctions.onRosterReceive(my.roster.items);
          $.eventMessage(currentUser.node, "You are disconnected");
          $.disableTextBox();
        },
        onRosterAdded:function (stanza) {
          $('#remember').removeClass('add').addClass('remove').text('Remove');
          my.roster.subscribe(currentUser.jid);
          XmppOnFunctions.onRosterReceive(my.roster.items);
        },
        contactEventBind:function (element) {
          $(element).click(function (e) {
            e.preventDefault();
            var jid = $(this).find(".roster-jid").text();
            var id = $(this).attr("href").replace('#', '');
            var name = $(this).find('.roster-name').text();

            currentUser.name = name;
            currentUser.jid = jid;
            currentUser.node = Strophe.getNodeFromJid(currentUser.jid );
            currentUser.id = id;
            console.log(currentUser);
            $.new_message_box.call(this, currentUser, false);
          });
          $('div.scrollable').trigger('scrollResize');
          $('input#searchTerm').quicksearch('#remembereds li', {
            'delay':200,
            'selector':'.roster-name',
            'onAfter':function () {
              $('div.scrollable').trigger('scrollResize');
            }
          })
        }
      },

      Xmpp = {
        sendMessage:function (message) {
          if (!isAlive) {
            connection.reset();
          }
          if (!currentUser.jid) {
            currentUser.node = Constants.SYSTEM_NODE;
            currentUser.resource = null;
            currentUser.jid = currentUser.node + '@' + my.domain;
            currentUser.id = $.XmppUtils.jidToId(currentUser.jid);

            $.eventMessage(currentUser.id, "You haven't selected any user. Connection to stranger...");
          }
          var msg = $msg({to:currentUser.jid, type:"chat"}).c("body").t(message);
          connection.send(msg);
        },


        attach:function (data) {
          console.log('Prebind succeeded. Attaching...');

          my.node = data['jid']['node'];
          my.domain = data['jid']['domain'];
          my.resource = data['jid']['resource'];

          $.getUserLocation(my.resource);

          my.jid =  my.node+ '@' + my.domain + '/' + my.resource;

          connection = new Strophe.Connection(Constants.BOSH_SERVICE);
          connection.attach(my.jid, data['http_sid'],
              parseInt(data['http_rid'], 10) + 2,
              XmppOnFunctions.onConnect);
        },

        initiateConnection:function () {
          var token = $('meta[name=csrf-token]').attr('content');
          var param = $('meta[name=csrf-param]').attr('content');
          var data = {};
          data[param] = token;

          $.ajax({
            type:'post',
            url:Constants.PRE_BINDING,
            dataType:'json',
            tryCount:0,
            retryLimit:3,
            success:Xmpp.attach,
            data:data,
            error:function (xhr, textStatus, errorThrown) {
              if (textStatus == 'timeout') {
                this.tryCount++;
                if (this.tryCount <= this.retryLimit) {
                  //try again
                  $.ajax(this);
                  return;
                }
                return;
              }
              if (xhr.status == 404) {
                //handle error
              } else {
                //handle error
              }

            }
          })
        },

        connect:function () {
          connection = new Strophe.Connection('http://bosh.metajack.im:5280/xmpp-httpbind');
          connection.connect("codegambler@gmail.com", "kim-10vriti", Xmpp.onConnect);
        }
      }


  $.xmppStart = function () {
    Xmpp.initiateConnection();
    //Xmpp.connect();
  }

  $.xmppSendMessage = function (msg) {
    Xmpp.sendMessage(msg);
    console.log(currentUser);
    $.myInlineMessage(currentUser.id, msg);
  }

  $.xmppStranger = function () {
    currentUser.node = Constants.SYSTEM_NODE;
    currentUser.resource = null;
    currentUser.jid = currentUser.node + '@' + my.domain ;
    currentUser.id = $.XmppUtils.jidToId(currentUser.jid);
    currentUser.name = Constants.SYSTEM_NAME;

    $.new_message_box.call($("<a data-toggle='chat' class='roster-contact'  href='#" + currentUser.id + "'></a>"),
        currentUser, true);
    $.eventMessage(currentUser.id, "Connecting to a Stranger...");
    Xmpp.sendMessage("\\c");
  }

  $.xmppStrangerDisconnect = function () {
    $.xmppSendMessage("\\d");
    currentUser.node= null;
    currentUser.jid = null;
    currentUser.name = null;

  }

  $.xmppRemoveUser = function () {
    my.roster.remove(currentUser.jid, XmppOnFunctions.onRosterRemoved);
  }

  $.xmppAddUser = function () {
    var jid = currentUser.jid;
    var name = currentUser.name;

    name = name || null;
    my.roster.add(jid, name, [], Xmpp.onRosterAdded);
  }

  $.xmppBlockUser = function () {
    var jid = currentUser.jid;
    var reason = $("#chattypebox").data('reason');
    $.xmppSendMessage("\\b:" + reason);
    my.roster.remove(jid, Xmpp.onRosterRemoved);
  }

  $.startStrangerChat = function () {
    console.log(currentUser.status);
    var status = currentUser.status;
    if (status == null || status == ChatButtonStatus.HANGOUT) {
      $.changeChatStatusChanged(ChatButtonStatus.CONNECTING);
      $.xmppStranger();
    } else if (status == ChatButtonStatus.CONNECTING || status == ChatButtonStatus.DISCONNECT) {
      $.changeChatStatusChanged(ChatButtonStatus.CONFIRM_DISCONNECT);
    } else if (status == ChatButtonStatus.CONFIRM_DISCONNECT) {
      $.changeChatStatusChanged(ChatButtonStatus.HANGOUT);
      $.xmppStrangerDisconnect();
    }

  }

  $.changeChatStatusChanged = function (status) {
    currentUser.status = status;
    if (status == ChatButtonStatus.CONNECTING) {
      $("#stranger").text("Connecting..");
    } else if (status == ChatButtonStatus.CONFIRM_DISCONNECT) {
      $("#stranger").text("Are you sure?");
    } else if (status == ChatButtonStatus.DISCONNECT) {
      $("#stranger").text("Disconnect");
    } else if (status == ChatButtonStatus.HANGOUT) {
      $("#stranger").text("Hang Out");
    }
  }
})(jQuery);

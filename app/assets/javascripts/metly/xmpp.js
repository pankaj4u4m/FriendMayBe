//= require ./chatUI
//= require ./scrollbar
//= require ./XmppUtils
(function ($) {
  var BOSH_SERVICE = '/bosh',
      PRE_BINDING = '/login',
      connection = null,
      roster = null,
      me = null,
      domain = null,
      isAlive = false,
      Xmpp = {
        onConnect:function (status) {
          isAlive = false;
          if (status == Strophe.Status.CONNECTED || status === Strophe.Status.ATTACHED) {
            console.debug('Strophe is attached.');
            Xmpp.startup()
          }
        },
        onMessage:function (message) {
          console.log(message);
          var full_jid = $(message).attr('from');
          var jid = Strophe.getBareJidFromJid(full_jid);
          var jid_id = Strophe.getNodeFromJid(jid);
          var composing = $(message).find('composing');
          if (composing.length > 0) {
            $('#' + jid_id + ' .chat-chats').append(
                "<div class='chat-event'>" +
                    Strophe.getNodeFromJid(jid) +
                    " is typing...</div>");

            $("#" + jid_id).trigger("scrollResize");
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
            $('#' + jid_id + ' .chat-event').remove();

            var chat = "<div class=\"message\"><p class='chat me'><strong style='color:#2180D8;'>Stranger:</strong>" +
                body + "</p></div>"
            var currentTab = $("#chattypebox").data('id');
            $(currentTab + " .chat-chats").append(chat);
            $("#" + jid_id).trigger("scrollResize");
          }


          return true;
        },
        startup:function () {
          connection.addHandler(Xmpp.onMessage, null, 'message', "chat");
          // Xmpp.connection.addHandler(Xmpp.onRosterChange, "jabber:iq:roster", "iq", "set");
//          connection.addHandler(Xmpp.onPresence, null, "presence");

          connection.send($pres().tree());
          roster = connection.roster;
          roster.get(Xmpp.onRosterReceive);
          roster.registerCallback(Xmpp.onPresence)
          isAlive = true;
        },
        onPresence: function(list, item){
          if(item){
            var contacts = $('#remembereds li');
            if (contacts.length > 0) {
              $.XmppUtils.updateContact(contacts, item);
            } else {
              var element = $.XmppUtils.getRosterElement(item);
              $('#remembereds ul').append(element);
              Xmpp.contactEventBind(element);
            }
          }
          return true;
        },
        onRosterReceive:function (data) {
//          console.log(data);
          data.sort(function(a, b){
            var r = $.XmppUtils.presenceValue($.XmppUtils.rosterStatus(b.resources))- $.XmppUtils.presenceValue($.XmppUtils.rosterStatus(a.resources)) ;
            if(r == 0){
              return (a.name || a.jid).localeCompare((b.name|| b.jid));
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
          Xmpp.contactEventBind($("#remembereds a"));
          return true;
        },
        onRosterRemoved:function(stanza){
          $('#remember').removeClass('remove').addClass('add').text('Remember');
          Xmpp.onRosterReceive(roster.items);
        },
        onRosterAdded:function(stanza){
          $('#remember').removeClass('add').addClass('remove').text('Remove');
          roster.subscribe($("#chattypebox").data('jid'));
          Xmpp.onRosterReceive(roster.items);
        },
        contactEventBind:function (element) {
          $(element).click(function (e) {
            e.preventDefault();
            var jid = $(this).find(".roster-jid").text();
            var id = $(this).attr("href").replace('#', '');
            var name = $(this).find('.roster-name').text();
            Xmpp._new_message_box.call(this, id, jid, name, true);

          })
          $('div.scrollable').trigger('scrollResize');
          $('input#searchTerm').quicksearch('#remembereds li', {
            'delay': 300,
            'selector': '.roster-name',
            'onAfter': function () {
              $('div.scrollable').trigger('scrollResize');
             }
          })
        },

        _new_message_box:function (id, jid, name, isRoster) {
          console.log("parameter id:" + id + "jid:" + jid);
          if ($("#" + id).length <= 0) {
            var chatbar = "<div id='" + id + "' class='tab-pane' style='height:100%;'>" +
                "<div class='chat-chats'></div></div>";

            var messageBar = $("#messagebar");
            $(messageBar).append(chatbar);
            $("#" + id).setScrollPane({
              scrollToY:$(this).data('jsp') == null ? 10000 : $(this).data('jsp').getContentPositionY(),
              width:12,
              height:10,
              maintainPosition:false
            });
          }

          $("#chattypebox").data('id', '#' + id);
          $("#chattypebox").data('jid', jid);
          $('#chattypebox').data('name', name)
          $("#buddy-name").text(name)
          $('#buddy-options').css('visibility', 'visible');
          if (!isRoster) {
            $('#remember').removeClass('remove').addClass('add').text('Remember')
          } else {
            $('#remember').removeClass('add').addClass('remove').text('Remove')
          }
          $(this).tab('show');
          $(this).bind('shown', function (e) {
            $(this).trigger("scrollResize");
          });
        },

        attach:function (data) {
          console.log('Prebind succeeded. Attaching...');

          connection = new Strophe.Connection(BOSH_SERVICE);
          me = data['jid']['node'] + '@' + data['jid']['domain'] + '/' + data['jid']['resource'];
          connection.attach(me, data['http_sid'],
              parseInt(data['http_rid'], 10) + 2,
              Xmpp.onConnect);
          domain = data['jid']['domain'];
        },

        initiateConnection:function () {
          var token = $('meta[name=csrf-token]').attr('content');
          var param = $('meta[name=csrf-param]').attr('content');
          var data = {};
          data[param] = token;
          $.ajax({
            type:'post',
            url:PRE_BINDING,
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

        getStranger:function (element) {
          var token = $('meta[name=csrf-token]').attr('content');
          var param = $('meta[name=csrf-param]').attr('content');
          var data = {};
          data[param] = token;
          data["me"] = Xmpp.me
          $.ajax({
            type:"POST",
            url:"/chats/stranger",
            dataType:'json',
            data:data,
            success:function (response) {
              if (response['stranger'] != null) {
                var jid = response['stranger'];
                $(element).changeChatStatusChanged({status:ChatButtonStatus.DISCONNECT, jid:jid});
                Xmpp._new_message_box.call($('<a class="roster-contact" href="#' + Strophe.getNodeFromJid(jid) + '" data-toggle="chat">'),
                    Strophe.getNodeFromJid(jid), jid, response['name'], false);
              } else {
                $(element).changeChatStatusChanged({status:ChatButtonStatus.HANGOUT, jid:null});
              }
            },
            error:function (xhr, textStatus, errorThrown) {
              $(this).changeChatStatusChanged({status:ChatButtonStatus.HANGOUT, jid:null});
            }
          })
        },

        disconnect:function () {

        },

        connect:function () {
          connection = new Strophe.Connection('http://bosh.metajack.im:5280/xmpp-httpbind');
          connection.connect("codegambler@gmail.com", "kim-10vriti", Xmpp.onConnect);
        },

        removeUser: function(){
          var jid = $("#chattypebox").data('jid');
          roster.remove(jid, Xmpp.onRosterRemoved);
        },

        addUser : function (){
          var jid = $("#chattypebox").data('jid');
          var name = $("#chattypebox").data('name');
          name = name || null;
          roster.add(jid, name, [], Xmpp.onRosterAdded);

        }
      }


  $.xmppStart = function () {
    //Xmpp.initiateConnection()
    Xmpp.connect();
  }

  $.xmppSend = function (data) {
    if (!isAlive) {
      connection.reset();
    }
    var msg = $msg({to:$("#chattypebox").data('jid'), type:"chat"}).c("body").t(data);
    connection.send(msg);
  }

  $.xmppStranger = function (element) {
    Xmpp.getStranger(element);
  }

  $.xmppStrangerDisconnect = function (element) {
    Xmpp.disconnect(element);
  }

  $.xmppRemoveUser = function(){
    Xmpp.removeUser();
  }

  $.xmppAddUser = function(){
    Xmpp.addUser();
  }

})(jQuery);

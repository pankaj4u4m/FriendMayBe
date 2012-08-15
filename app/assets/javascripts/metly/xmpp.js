//= require ./chatUI
//= require ./scrollbar
(function ($) {
    var Xmpp = {
        BOSH_SERVICE: '/bosh',
        PRE_BINDING: '/login',
        connection: null,
        roster: null,
        me: null,
        domain: null,
        isAlive: false,
        pending_subscriber: null,


        onConnect: function (status) {
            Xmpp.isAlive = false;
            if (status == Strophe.Status.CONNECTED || status === Strophe.Status.ATTACHED) {
                console.log('Strophe is attached.');
                Xmpp.startup()
            }
        },
        onMessage: function (message) {
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

                Xmpp.scrollChat(jid_id);
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
                var currentTab = "#"+$("#current-user").val();
                $('#' + jid_id + " .chat-chats").append(chat);
                Xmpp.scrollChat(jid_id);
            }



            return true;
        },
        scrollChat: function(jid_to){
            $("#" + jid_to).trigger("scrollResize");
        },
        startup: function(){
            Xmpp.connection.addHandler(Xmpp.onMessage, null, 'message', "chat");
            // Xmpp.connection.addHandler(Xmpp.onRosterChange, "jabber:iq:roster", "iq", "set");
            // Xmpp.connection.addHandler(Xmpp.onPresence, null, "presence");

            Xmpp.connection.send($pres().tree());

            Xmpp.roster  = Xmpp.connection.roster;
            Xmpp.roster.get(Xmpp.onRosterReceive);



            Xmpp.isAlive = true;
        },
        rosterStatus: function(data){
            var status = 'offline';
            for (var k in this.resources) {
                if (status != 'online' && this.resources[k].show === "online") {
                    status = 'online'
                } else if (status != 'online' && status != 'away' && this.resources[k].show === "away"){
                    status = 'away';
                }
            }
            return status;
        },
        onRosterReceive: function(data){
            $(data).each(function(){
                var jid = this.jid;
                var name = this.name || jid;

                console.log(jid);
                console.log(name);

                // transform jid into an id
                var jid_id = Strophe.getNodeFromJid(jid);

                var contact = $("<li>" +
                    "<a data-toggle='chat' class='roster-contact'  href='#"+jid_id +"'>" +
                    "<div class='roster-jid' style=\"display:none\">" +
                    jid +
                    "</div><div class='"+ Xmpp.rosterStatus(data)+ "'> "+
                    "</div><div class='roster-name'>" +
                    name +
                    "</div></a></li>");

                Xmpp.insertContact(contact);
            });
            true;
        },
        presenceValue: function (elem) {
            if (elem.hasClass('online')) {
                return 2;
            } else if (elem.hasClass('away')) {
                return 1;
            }

            return 0;
        },
        insertContact: function (elem) {
            var jid = elem.find('.roster-jid').text();
            var pres = Xmpp.presenceValue(elem.find('.roster-contact'));

            var contacts = $('#remembereds li');
            console.log(elem)

            if (contacts.length > 0) {
                var inserted = false;
                contacts.each(function () {
                    var cmp_pres = Xmpp.presenceValue(
                        $(this).find('.roster-contact'));
                    var cmp_jid = $(this).find('.roster-jid').text();

                    if (pres > cmp_pres) {
                        $(this).before(elem);
                        inserted = true;
                        return false;
                    } else if (pres === cmp_pres) {
                        if (jid < cmp_jid) {
                            $(this).before(elem);
                            inserted = true;
                            return false;
                        }
                    }
                });

                if (!inserted) {
                    $('#remembereds ul').append(elem);
                }
            } else {
                $('#remembereds ul').append(elem);
            }
            Xmpp.contactEventBind();
        },
        contactEventBind: function(){
            $("#remembereds a").click( function(e){
                e.preventDefault();
                var jid = $(this).find(".roster-jid").text();
                var id = $(this).attr("href").replace('#', '');
                if ($("#"+id).length <= 0){
                    var chatbar = "<div id='"+ id + "' class='tab-pane' style='height:100%;'>" +
                        "<div class='chat-chats'></div></div>";

                    var messageBar= $("#messagebar");
                    $(messageBar).append(chatbar);
                    $("#" + id ).setScrollPane({
                        scrollToY: $(this).data('jsp') == null?10000: $(this).data('jsp').getContentPositionY(),
                        width: 12,
                        height: 10,
                        maintainPosition: false
                    });
                }
                //$(chatbar).width($(messageBar).width());
                $("#current-user").val(id)
                $(this).tab('show');
            })

            $('a[data-toggle="chat"]').bind('shown', function (e) {
                console.log("logged");
                Xmpp.scrollChat($(this).attr("href").replace('#', ''));
                //console.log(e.relatedTarget) // previous
            });
        },
        attach: function (data) {
            console.log('Prebind succeeded. Attaching...');

            Xmpp.connection = new Strophe.Connection(Xmpp.BOSH_SERVICE);
            Xmpp.me = data['jid']['node'] + '@' + data['jid']['domain'] + '/' + data['jid']['resource'];
            Xmpp.connection.attach(Xmpp.me, data['http_sid'],
                parseInt(data['http_rid'], 10) + 2,
                Xmpp.onConnect);
            Xmpp.domain = data['jid']['domain'];
        },

        initiateConnection: function () {
            var token = $('meta[name=csrf-token]').attr('content');
            var param = $('meta[name=csrf-param]').attr('content');
            var data = {};
            data[param] = token;
            $.ajax({
                type:'post',
                url:Xmpp.PRE_BINDING,
                dataType:'json',
                tryCount: 0,
                retryLimit: 3,
                success:Xmpp.attach,
                data: data,
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
//        send: function (msg){
//            var token = $('meta[name=csrf-token]').attr('content');
//            var param = $('meta[name=csrf-param]').attr('content');
//            var data = {};
//            data[param] = token;
//            var s = msg.toString()
//            data["msg"] = s;
//            $.ajax({
//                type: "POST",
//                url: "/chats/sendmessage",
//                dataType: 'json',
//                data: data,
//                success: function(response){
//                    Xmpp.isAlive = response['status'];
//                }
//            })
//        },
        getStranger: function(element){
            var token = $('meta[name=csrf-token]').attr('content');
            var param = $('meta[name=csrf-param]').attr('content');
            var data = {};
            data[param] = token;
            data["me"] = Xmpp.me
            $.ajax({
                type: "POST",
                url: "/chats/stranger",
                dataType: 'json',
                data: data,
                success: function(response){
                    if(response['stranger'] != null){
                        $(element).changeChatStatusChanged({status: ChatButtonStatus.DISCONNECT, jid: response['stranger']});
                    } else {
                        $(element).changeChatStatusChanged({status: ChatButtonStatus.HANGOUT, jid: null});
                    }
                },
                error: function(xhr, textStatus, errorThrown){
                    $(this).changeChatStatusChanged({status: ChatButtonStatus.HANGOUT, jid: null});
                }
            })
        },
        disconnect: function(){

        },
        connect: function(){
            Xmpp.connection = new Strophe.Connection('http://bosh.metajack.im:5280/Xmpp-httpbind');
            Xmpp.connection.connect("codegambler@gmail.com", "kim-10vriti", Xmpp.onConnect);
        }
    }



    $.xmppStart = function () {
        Xmpp.initiateConnection()
        //Xmpp.connect();
    }

    $.xmppSend = function(data){
        if(!Xmpp.isAlive){
            Xmpp.connection.reset();
        }
        var msg = $msg({to:$("#current-user").val().trim()+"@" + Xmpp.domain, type:"chat"}).c("body").t(data);
        Xmpp.connection.send(msg);
    }
    $.xmppStranger = function(element){
        Xmpp.getStranger(element);
    }
    $.xmppStrangerDisconnect = function(element){
        Xmpp.disconnect(element);
    }

})(jQuery);

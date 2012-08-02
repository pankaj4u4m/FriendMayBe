(function ($) {
    var xmpp = {
        BOSH_SERVICE: '/bosh',
        PRE_BINDING: '/login',
        connection: null,
        me: null,
        isAlive: false,
        pending_subscriber: null,


        onConnect: function (status) {
            xmpp.isAlive = false;
            if (status == Strophe.Status.CONNECTING) {
                console.log('Strophe is connecting.');
            } else if (status == Strophe.Status.CONNFAIL) {
                console.log('Strophe failed to connect.');
            } else if (status == Strophe.Status.DISCONNECTING) {
                console.log('Strophe is disconnecting.');
            } else if (status == Strophe.Status.DISCONNECTED) {
                console.log('Strophe is disconnected.');
            } else if (status == Strophe.Status.CONNECTED) {
                console.log('Strophe is connected.');
                xmpp.startup();
            } else if (status === Strophe.Status.ATTACHED) {
                console.log('Strophe is attached.');
                xmpp.startup()
            } else if (status == Strophe.Status.AUTHFAIL){
                console.log('Strophe authentication failed.');
            } else if (status == Strophe.Status.ERROR){
                console.log('Strophe has some ERROR .');
            }

        },
        jidToId: function (jid) {
            return Strophe.getBareJidFromJid(jid)
                .replace(/@/g, "-")
                .replace(/\./g, "-");
        },

        onRoster: function(iq){
            console.log(iq);
            $(iq).find('item').each(function () {
                var jid = $(this).attr('jid');
                var name = $(this).attr('name') || jid;

                // transform jid into an id
                var jid_id = xmpp.jidToId(jid);

                var contact = $("<li id='" + jid_id + "'>" +
                    "<div class='roster-contact offline'>" +
                    "<div class='roster-name'>" +
                    name +
                    "</div><div class='roster-jid'>" +
                    jid +
                    "</div></div></li>");
                xmpp.insertContact(contact);
            });

            // set up presence handler and send initial presence
            xmpp.connection.addHandler(xmpp.onPresence, null, "presence");
            xmpp.connection.send($pres());
        },

        onPresence: function (presence) {
            var ptype = $(presence).attr('type');
            var from = $(presence).attr('from');
            var jid_id = xmpp.jidToId(from);

            if (ptype === 'subscribe') {
                // populate pending_subscriber, the approve-jid span, and
                // open the dialog
                xmpp.pending_subscriber = from;
                $('#approve-jid').text(Strophe.getBareJidFromJid(from));
                $('#approve_dialog').dialog('open');
            } else if (ptype !== 'error') {
                var contact = $('#roster-area li#' + jid_id + ' .roster-contact')
                    .removeClass("online")
                    .removeClass("away")
                    .removeClass("offline");
                if (ptype === 'unavailable') {
                    contact.addClass("offline");
                } else {
                    var show = $(presence).find("show").text();
                    if (show === "" || show === "chat") {
                        contact.addClass("online");
                    } else {
                        contact.addClass("away");
                    }
                }

                var li = contact.parent();
                li.remove();
                xmpp.insertContact(li);
            }

            // reset addressing for user since their presence changed
            var jid_id = xmpp.jidToId(from);
            $('#chat-' + jid_id).data('jid', Strophe.getBareJidFromJid(from));

            return true;
        },

        onRosterChange: function(iq){
            console.log(iq);
            $(iq).find('item').each(function () {
                var sub = $(this).attr('subscription');
                var jid = $(this).attr('jid');
                var name = $(this).attr('name') || jid;
                var jid_id = xmpp.jidToId(jid);
                if (sub === 'remove') {
                    // contact is being removed
                    $('#' + jid_id).remove();
                } else {
                    // contact is being added or modified
                    var contact_html = "<li id='" + jid_id + "'>" +
                        "<div class='" +
                        ($('#' + jid_id).attr('class') || "roster-contact offline") +
                        "'>" +
                        "<div class='roster-name'>" +
                        name +
                        "</div><div class='roster-jid'>" +
                        jid +
                        "</div></div></li>";

                    if ($('#' + jid_id).length > 0) {
                        $('#' + jid_id).replaceWith(contact_html);
                    } else {
                        xmpp.insertContact($(contact_html));
                    }
                }
            });

            return true;
        },
        onMessage: function (message) {
            var full_jid = $(message).attr('from');
            var jid = Strophe.getBareJidFromJid(full_jid);
            var jid_id = xmpp.jidToId(jid);

            if ($('#chat-' + jid_id).length === 0) {
                $('#chat-area').tabs('add', '#chat-' + jid_id, jid);
                $('#chat-' + jid_id).append(
                    "<div class='chat-messages'></div>" +
                        "<input type='text' class='chat-input'>");
            }

            $('#chat-' + jid_id).data('jid', full_jid);

            $('#chat-area').tabs('select', '#chat-' + jid_id);
            $('#chat-' + jid_id + ' input').focus();

            var composing = $(message).find('composing');
            if (composing.length > 0) {
                $('#chat-' + jid_id + ' .chat-messages').append(
                    "<div class='chat-event'>" +
                        Strophe.getNodeFromJid(jid) +
                        " is typing...</div>");

                xmpp.scrollChat(jid_id);
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
                $('#chat-' + jid_id + ' .chat-event').remove();

                // add the new message
                $('#chat-' + jid_id + ' .chat-messages').append(
                    "<div class='chat-message'>" +
                        "&lt;<span class='chat-name'>" +
                        Strophe.getNodeFromJid(jid) +
                        "</span>&gt;<span class='chat-text'>" +
                        "</span></div>");

                $('#chat-' + jid_id + ' .chat-message:last .chat-text')
                    .append(body);

                xmpp.scrollChat(jid_id);
            }

            return true;
        },
        scrollChat: function (jid_id) {
            var div = $('#chat-' + jid_id + ' .chat-messages').get(0);
            div.scrollTop = div.scrollHeight;
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
            var pres = xmpp.presenceValue(elem.find('.roster-contact'));

            var contacts = $('#roster-area li');

            if (contacts.length > 0) {
                var inserted = false;
                contacts.each(function () {
                    var cmp_pres = xmpp.presenceValue(
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
                    $('#roster-area ul').append(elem);
                }
            } else {
                $('#roster-area ul').append(elem);
            }
        },
        startup: function(){
            xmpp.connection.send($pres().tree());
            var iq = $iq({type: 'get'}).c('query', {xmlns: 'jabber:iq:roster'});
            xmpp.connection.sendIQ(iq, xmpp.onRoster);
            xmpp.isAlive = true;
        },

        attach: function (data) {
            console.log('Prebind succeeded. Attaching...');

            xmpp.connection = new Strophe.Connection(xmpp.BOSH_SERVICE);
            xmpp.me = data['jid']['node'] + '@' + data['jid']['domain'] + '/' + data['jid']['resource'];
            xmpp.connection.attach(xmpp.me, data['http_sid'],
                parseInt(data['http_rid'], 10) + 2,
                xmpp.onConnect);
            xmpp.connection.addHandler(xmpp.onMessage, null, 'message', null, null, null);
            xmpp.connection.addHandler(xmpp.onRosterChange, "jabber:iq:roster", "iq", "set");
        },

        initiateConnection: function () {
            var token = $('meta[name=csrf-token]').attr('content');
            var param = $('meta[name=csrf-param]').attr('content');
            var data = {};
            data[param] = token;
            $.ajax({
                type:'post',
                url:xmpp.PRE_BINDING,
                dataType:'json',
                tryCount: 0,
                retryLimit: 3,
                success:xmpp.attach,
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
        on_items: function (iq, elem) {
            var items = $(iq).find("item");
            if (items.length > 0) {
                $(elem).parent().append("<ul></ul>");

                var list = $(elem).parent().find("ul");

                $(iq).find("item").each(function () {
                    var node = $(this).attr('node');
                    list.append("<li><span class='item'>" +
                        $(this).attr("jid") +
                        (node ? ":" + node : "") +
                        "</span></li>");
                });
            }
        },
        on_info: function (iq, elem) {
            if ($('.selected').length > 0 &&
                elem !== $('.selected')[0]) {
                return;
            }

            $('#feature-list').empty();
            $(iq).find("feature").each(function () {
                $('#feature-list').append("<li>" +
                    $(this).attr('var') +
                    "</li>");
            });

            $('#identity-list').empty();
            $(iq).find("identity").each(function () {
                $('#identity-list').append("<li><dl><dt>Name</dt><dd>" +
                    ($(this).attr('name') || "none") +
                    "</dd><dt>Type</dt><dd>" +
                    ($(this).attr('type') || "none") +
                    "</dd><dt>Category</dt><dd>" +
                    ($(this).attr('category') || "none") +
                    "</dd></dl></li>");
            });
        },
        on_items: function (iq, elem) {
            var items = $(iq).find("item");
            if (items.length > 0) {
                $(elem).parent().append("<ul></ul>");

                var list = $(elem).parent().find("ul");

                $(iq).find("item").each(function () {
                    var node = $(this).attr('node');
                    list.append("<li><span class='item'>" +
                        $(this).attr("jid") +
                        (node ? ":" + node : "") +
                        "</span></li>");
                });
            }
        },

        on_info: function (iq, elem) {
            if ($('.selected').length > 0 &&
                elem !== $('.selected')[0]) {
                return;
            }

            $('#feature-list').empty();
            $(iq).find("feature").each(function () {
                $('#feature-list').append("<li>" +
                    $(this).attr('var') +
                    "</li>");
            });

            $('#identity-list').empty();
            $(iq).find("identity").each(function () {
                $('#identity-list').append("<li><dl><dt>Name</dt><dd>" +
                    ($(this).attr('name') || "none") +
                    "</dd><dt>Type</dt><dd>" +
                    ($(this).attr('type') || "none") +
                    "</dd><dt>Category</dt><dd>" +
                    ($(this).attr('category') || "none") +
                    "</dd></dl></li>");
            });
        }
    }


    $.xmppStart = function () {
        xmpp.initiateConnection()
    }

    $.xmppSend = function(data){
        if(!xmpp.isAlive){
            xmpp.connection.reset();
        }
        var msg = $msg({to:$("#current-user").val().trim(), type:"chat"}).c("body").t(data);
        xmpp.connection.send(msg);
    }

    $(document).bind('roster_changed', function (ev, roster) {
        console.log(roster);

        $('#roster').empty();

        var empty = true;
        $.each(roster.contacts, function (jid) {
            empty = false;

            var status = "offline";
            if (this.online()) {
                var away = true;
                for (var k in this.resources) {
                    if (this.resources[k].show === "online") {
                        away = false;
                    }
                }
                status = away ? "away" : "online";
            }

            var html = [];
            html.push("<div class='contact " + status + "'>");

            html.push("<div class='name'>");
            html.push(this.name || jid);
            html.push("</div>");

            html.push("<div class='jid'>");
            html.push(jid);
            html.push("</div>");

            html.push("</div>");

            $('#roster').append(html.join(''));
        });

        if (empty) {
            $('#roster').append("<i>No contacts :(</i>");
        }
    });
})(jQuery);

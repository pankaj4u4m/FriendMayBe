(function ($) {
    var xmpp = {
        BOSH_SERVICE: '/bosh',
        PRE_BINDING: '/login',
        connection: null,
        roster: null,
        me: null,
        isAlive: false,
        pending_subscriber: null,


        onConnect: function (status) {
            xmpp.isAlive = false;
            if (status == Strophe.Status.CONNECTED || status === Strophe.Status.ATTACHED) {
                console.log('Strophe is attached.');
                xmpp.startup()
            }
        },
        jidToId: function (jid) {
            return Strophe.getBareJidFromJid(jid)
                .replace(/@/g, "-")
                .replace(/\./g, "-");
        },

        onMessage: function (message) {
            console.log(message);
            return true;
        },
        scrollChat: function (jid_id) {
            var div = $('#chat-' + jid_id + ' .chat-messages').get(0);
            div.scrollTop = div.scrollHeight;
        },
        startup: function(){
            xmpp.connection.addHandler(xmpp.onMessage, null, 'message', null, null, null);
            // xmpp.connection.addHandler(xmpp.onRosterChange, "jabber:iq:roster", "iq", "set");
            // xmpp.connection.addHandler(xmpp.onPresence, null, "presence");

            xmpp.connection.send($pres().tree());
            //var iq = $iq({type: 'get'}).c('query', {xmlns: 'jabber:iq:roster'});
            //xmpp.connection.sendIQ(iq, ));
            var millisecondsToWait = 2000;
            setTimeout(function() {
                roster = xmpp.connection.roster;
                roster.get(xmpp.onRosterReceive);
            }, millisecondsToWait);


            xmpp.isAlive = true;
        },
        onRosterReceive: function(data){
            console.log("get called")
            console.log(data);
            true;
        },
        attach: function (data) {
            console.log('Prebind succeeded. Attaching...');

            xmpp.connection = new Strophe.Connection(xmpp.BOSH_SERVICE);
            xmpp.me = data['jid']['node'] + '@' + data['jid']['domain'] + '/' + data['jid']['resource'];
            xmpp.connection.attach(xmpp.me, data['http_sid'],
                parseInt(data['http_rid'], 10) + 2,
                xmpp.onConnect);
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
        connect: function(){
            xmpp.connection = new Strophe.Connection('http://bosh.metajack.im:5280/xmpp-httpbind');
            xmpp.connection.connect("codegambler@gmail.com", "kim-10vriti", xmpp.onConnect);
        }
    }



    $.xmppStart = function () {
        xmpp.initiateConnection()
        //xmpp.connect();
    }

    $.xmppSend = function(data){
        if(!xmpp.isAlive){
            xmpp.connection.reset();
        }
        var msg = $msg({to:$("#current-user").val().trim(), type:"chat"}).c("body").t(data);
        xmpp.connection.send(msg);
    }
})(jQuery);

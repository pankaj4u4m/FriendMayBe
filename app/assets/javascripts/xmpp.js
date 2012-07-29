(function ($) {

    var BOSH_SERVICE = '/bosh';
    var PRE_BINDING = '/login';
    var connection = null;
    var me = null;
    var isAlive = false;

    var onMessage = function (msg) {
        var to = msg.getAttribute('to');
        var from = msg.getAttribute('from');
        var type = msg.getAttribute('type');
        var elems = msg.getElementsByTagName('body');

        if (elems.length > 0) {
            var body = elems[0];

            console.log('ECHOBOT: I got a message from ' + from + ': ' +
                Strophe.getText(body));

            var reply = $msg({to:from, from:to, type:'chat'})
                .cnode(Strophe.copyElement(body));
            connection.send(reply.tree());

            console.log('ECHOBOT: I sent ' + from + ': ' + Strophe.getText(body));
        }

        // we must return true to keep the handler alive.
        // returning false would remove it after it finishes.
        return true;
    }


    var onConnect = function (status) {
        isAlive = false;
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
            isAlive = true;
        } else if (status === Strophe.Status.ATTACHED) {
            console.log('Strophe is attached.');
            connection.send($pres().tree());
            isAlive = true;
        } else if (status == Strophe.Status.AUTHFAIL){
            console.log('Strophe authentication failed.');
        } else if (status == Strophe.Status.ERROR){
            console.log('Strophe has some ERROR .');
        }

    }

    var attach = function (data) {
        console.log('Prebind succeeded. Attaching...');

        connection = new Strophe.Connection(BOSH_SERVICE);
        me = data['jid']['node'] + '@' + data['jid']['domain'] + '/' + data['jid']['resource']
        connection.attach(me, data['http_sid'],
            parseInt(data['http_rid'], 10) + 2,
            onConnect);
        connection.addHandler(onMessage, null, 'message', null, null, null);
    }

    var initiateConnection = function () {
        $.ajax({
            type:'get',
            url:PRE_BINDING,
            dataType:'json',
            tryCount: 0,
            retryLimit: 3,
            success:attach,
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
    }

    $.xmppStart = function () {
        initiateConnection()
    }

    $.xmppSend = function(data){
        if(!isAlive){
           connection.reset();
        }
        var msg = $msg({to:$("#current-user").val().trim(), type:"chat"}).c("body").t(data);
        connection.send(msg);
    }

})(jQuery);

(function ($) {

    var BOSH_SERVICE = '/bosh';
    var connection = null;
    var jid = null;

    function onMessage(msg) {
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


    function onConnect(status) {
        if (status == Strophe.Status.CONNECTING) {
            console.log('Strophe is connecting.');
        } else if (status == Strophe.Status.CONNFAIL) {
            console.log('Strophe failed to connect.');
        } else if (status == Strophe.Status.DISCONNECTING) {
            console.log('Strophe is disconnecting.');
        } else if (status == Strophe.Status.DISCONNECTED) {
            console.log('Strophe is disconnected.');
            // $.xmppConnect();
        } else if (status == Strophe.Status.CONNECTED) {
            console.log('Strophe is connected.');
            connection.send($pres().tree());
        } else if (status === Strophe.Status.ATTACHED) {
            console.log('Strophe is attached.');
            connection.send($pres().tree());
        }

    }

    function attach(data){
        console.log('Prebind succeeded. Attaching...');

        connection = new Strophe.Connection(BOSH_SERVICE);
        connection.attach(data['jid']['node']+'@' + data['jid']['domain']+'/'+data['jid']['resource'],
            data['http_sid'],
            parseInt(data['http_rid'], 10) + 2,
            onConnect);
        connection.addHandler(onMessage, null, 'message', null, null, null);
    }
    $.xmppConnect = function () {
        $.ajax({
            type: 'post',
            url:'/login',
            dataType: 'json',
            success: attach
        })
    }
})(jQuery);

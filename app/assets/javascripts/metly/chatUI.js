ChatButtonStatus = {
    HANGOUT: 0,
    CONNECTING: 1,
    CONFIRM_DISCONNECT :2,
    DISCONNECT: 3
};
(function($){
    $.fn.startChat = function(){
        console.log($(this).data());
        var status = $(this).data().status;
        if(status == null || status == ChatButtonStatus.HANGOUT){
            $(this).changeChatStatusChanged({status:ChatButtonStatus.CONNECTING, jid: null});
            $.xmppStranger(this);
        } else if(status == ChatButtonStatus.CONNECTING || status == ChatButtonStatus.DISCONNECT){
            $(this).changeChatStatusChanged({status:ChatButtonStatus.CONFIRM_DISCONNECT, jid: null});
        } else if(status == ChatButtonStatus.CONFIRM_DISCONNECT){
            $(this).changeChatStatusChanged({status:ChatButtonStatus.HANGOUT, jid: null});
            $.xmppStrangerDisconnect(this);
        }

    }

    $.fn.changeChatStatusChanged = function(data){

        if(data.status == ChatButtonStatus.CONNECTING){
            $(this).data({status:ChatButtonStatus.CONNECTING})
            $(this).text("Connecting..");
        } else if(data.status == ChatButtonStatus.CONFIRM_DISCONNECT){
            $(this).data( {status:ChatButtonStatus.CONFIRM_DISCONNECT});
            $(this).text("Disconnect?");
        } else if(data.status == ChatButtonStatus.DISCONNECT){
            $(this).data({status: ChatButtonStatus.DISCONNECT});
            $(this).text("Disconnect");
        } else if(data.status == ChatButtonStatus.HANGOUT) {
            $(this).data({status:ChatButtonStatus.HANGOUT});
            $(this).text("Hang Out");
        }
        $('#current-user').val(data.jid);
    }
}(jQuery));

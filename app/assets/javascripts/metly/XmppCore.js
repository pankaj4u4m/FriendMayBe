(function ($) {
  function XmppCore() {
    /**
     * currentUser = {
     node:"",
     jid:"",
     status:"",
     id:"",
     pres:""
     };
     * @type {Object}
     */
    var currentUser = {};
    /**
     * requests = [
     *  {
     jid:"",
     name:"",
     }
     ];
     * @type {Object}
     */
    var requests = [];

    /**
     * messages = [
     {
     body:"",
     id:"",
     sender:"",
     receiver:""
     }
     ];
     * @type {Object}
     */
    var messages = [];
    var minMessageId = Math.pow(2, 63) - 1;

    /**
     *  my = {
     node:"",
     domain:"",
     resource:"",
     jid:"",
     roster:"",
     requests:"",
     messages:"",
     };
     * @type {Object}
     */
    var my = {
      requests:requests,
      messages:messages
    };

    var connection = null;
    var alive = false;
    var _rosterStatus = null;
    var _jidToId = null;
    var self = this;

    this.Constructor = function (rosterStatus, jidToId) {
      _rosterStatus = rosterStatus;
      _jidToId = jidToId;
    };

    this.getCurrentUser = function () {
      return currentUser;
    };

    this.setCurrentUser = function (user) {
      currentUser = user;
    };

    this.getMy = function () {
      return my;
    };

    this.setMy = function (me) {
      my = me;
    };

    this.getConnection = function () {
      return connection;
    };

    this.setConnection = function (conn) {
      connection = conn;
    };
    this.isAlive = function () {
      console.log(alive);
      return alive;
    };
    this.setAlive = function (live) {
      console.log(live);
      alive = live;
    };

    this.getRequests = function () {
      return requests;
    };
    this.addReplaceRequests = function (jid, name) {
      var action = Action.ADD;
      jid = jid + '@' + my.domain;
      for (var i = 0; i < requests.length; i++) {
        if (requests[i] && requests[i].jid == jid) {
          messages.splice(i, 1);
          action = Action.REPLACE;
          break;
        }
      }
      var item = {
        id  :_jidToId(jid),
        jid :jid,
        name:name
      };
      requests.push(item);
      return {item:item, action:action};
    };

    this.getMessages = function () {
      return messages;
    };

    this.getMinMessageId = function () {
      return minMessageId;
    };

    this.addReplaceMessages = function (id, body, sender, receiver) {
      var type = MessageType.RECEIVED;
      var action = Action.ADD;
      if (sender == my.node) {
        sender = receiver;
        type = MessageType.SENT;
      }
      sender = sender + '@' + my.domain;
      for (var i = 0; i < messages.length; i++) {
        if (messages[i] && messages[i].sender == sender) {
          messages.splice(i, 1);
          action = Action.REPLACE;
          break;
        }
      }
      var item = {
        id    :_jidToId(sender),
        body  :body,
        sender:sender,
        type  :type
      };
      messages.push(item);
      if (id < minMessageId) {
        minMessageId = id;
      }
      return {item:item, action:action};
    };

    this.getRosterName = function (jid) {
      if (my.roster) {
        var item = my.roster.findItem(jid);
        if (item) {
          return item.name;
        }
      }
      return Constants.SYSTEM_NAME;
    };

    this.getRosterStatus = function (jid) {
      if (my.roster) {
        var item = my.roster.findItem(jid);
        if (item) {
          return _rosterStatus(item.resources);
        }
      }
      return _rosterStatus('offline');

    };

    this.acceptRequest = function (jid, name) {
      //TODO
      console.log(jid + " : " + name);
    };

    this.rejectRequest = function (jid, name) {
      //TODO
      console.log(jid + " : " + name);
    };
  }

  var _INSTANCE = new XmppCore();
  $.getXmppCore = function () {
    return _INSTANCE;
  };
})(jQuery);

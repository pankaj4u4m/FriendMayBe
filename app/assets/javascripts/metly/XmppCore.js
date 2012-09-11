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
    var minMessageId = Constants.MAX_LONG;

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
    var _xmppUtils = null;
    var _xmppOnMethods = null;
    var self = this;

    this.Constructor = function (xmppOnMethods, xmppUtils) {
      _xmppOnMethods = xmppOnMethods;
      _xmppUtils = xmppUtils;
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
      if(jid.indexOf('@') <= 0){
        jid = jid + '@' + my.domain;
      }

      var jidId = _xmppUtils.jidToId(jid)
      for (var i = 0; i < requests.length; i++) {
        if (requests[i] && requests[i].id == jidId) {
          messages.splice(i, 1);
          action = Action.REPLACE;
          break;
        }
      }
      var item = {
        id  :jidId,
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
      if(sender.indexOf('@') <= 0){
        sender = sender + '@' + my.domain;
      }
      var jidId = _xmppUtils.jidToId(sender);
      if (jidId == my.id) {
        if(receiver.indexOf('@') <= 0){
          receiver = receiver + '@' + my.domain;
        }
        sender = receiver;
        jidId = _xmppUtils.jidToId(sender);
        type = MessageType.SENT;
      }
      for (var i = 0; i < messages.length; i++) {
        if (messages[i] && messages[i].id == jidId) {
          messages.splice(i, 1);
          action = Action.REPLACE;
          break;
        }
      }
      var item = {
        id    :jidId,
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
          return item.name || Strophe.getNodeFromJid(jid);
        }
      }
      return Constants.SYSTEM_NAME;
    };

    this.getRosterStatus = function (jid) {
      if (my.roster) {
        var item = my.roster.findItem(jid);
        if (item) {
          return _xmppUtils.rosterStatus(item.resources);
        }
      }
      return _xmppUtils.rosterStatus('offline');

    };

    this.acceptRequest = function (jid, name) {
      console.log(jid + " : " + name);
      self.addUser(jid, name);
    };

    this.rejectRequest = function (jid, name) {
      console.log(jid + " : " + name);
      my.roster.unsubscribe(jid);
      my.roster.unauthorize(jid);
      my.roster.remove(jid);
    };

    this.removeUser = function () {
      my.roster.remove(currentUser.jid, _xmppOnMethods.onRosterRemoved);
    };

    this.addUser = function (jid, name) {
      jid = jid || currentUser.jid;
      name = name || currentUser.name;

      if(name == Constants.SYSTEM_NAME){
        name = null;
      }
      name = name || jid;
      my.roster.add(jid, name, [], _xmppOnMethods.onRosterAdded);
      my.roster.subscribe(jid);
      my.roster.authorize(jid);
    };
  }

  var _INSTANCE = new XmppCore();
  $.getXmppCore = function () {
    return _INSTANCE;
  };
})(jQuery);

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
    var my = {};
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

    var connection = null;
    var alive = false;

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

    this.getRequests = function(){
      return requests;
    };
    this.addRequest = function(jid, name){
      requests.push({
        jid: jid,
        name: name
      });
    };

    this.getMessages = function(){
      return messages;
    };

    this.addMessages = function(body, id, sender, receiver){
      messages.push({
          body: body,
          id: id,
          sender: sender,
          receiver: receiver
      });
    };
  }

  var _INSTANCE = new XmppCore();
  $.getXmppCore = function () {
    return _INSTANCE;
  };
})(jQuery);

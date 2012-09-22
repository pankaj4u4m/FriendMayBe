/**
 * Created with JetBrains RubyMine.
 * User: kpankaj
 * Date: 8/19/12
 * Time: 3:47 AM
 * To change this template use File | Settings | File Templates.
 */
(function ($) {
  function XmppUtils(){
    var self = this;
    this.isCommand = function (msg) {
      if (msg == '\\c') return 'Connecting to a Stranger..';
      if (msg == '\\d') return 'Disconnected!';
      return false;
    };
    this.processMessage = function(message){
      var hyperlink = new RegExp( '(http://.*\\s?)', 'g' );
      message = message.replace(hyperlink, "<a href='$1' class='btn-link'>$1</a>");
      return message;
    };
    this.jidToId = function (jid) {
      var node = Strophe.getNodeFromJid(jid);
      if(node){
        return node.replace(/\./g, "-");
      }
      return node;
    };
    this.rosterStatus = function (resources) {
      var status = 'offline';
//      console.log(resources);
      $.each(resources, function (key, value) {
//        console.log(value);
        if (value.show === "online" || value.show === "") {
          status = 'online'
        } else if (status != 'online' && value.show === "away") {
          status = 'away';
        }
      });
      return status;
    };
    this.presenceValue = function (elem) {
      if (elem == 'online') {
        return 2;
      } else if (elem == 'away') {
        return 1;
      } else if (elem == 'offline') {
        return 0
      } else if ($(elem).hasClass('online')) {
        return 2;
      } else if ($(elem).hasClass('away')) {
        return 1;
      }

      return 0;
    };
    this.setPresence = function (element, pres) {
      $(element).removeClass('online');
      $(element).removeClass('away');
      $(element).removeClass('offline');
      if (pres == 2) {
        $(element).addClass('online');
      } else if (pres == 1) {
        $(element).addClass('away');
      } else {
        $(element).addClass('offline');
      }
    };
    this.updateContact = function (list, roster) {
      var id = self.jidToId(roster.jid);
      var name = roster.name || roster.jid;
      var pres = self.presenceValue(self.rosterStatus(roster.resources));

      var inserted = false;
      var parent = $(list).parent();
      var element = parent.find('.' + id);

      if (!element) {
        element = self.getRosterElement(roster)
      } else {
        element.detach();
        self.setPresence($(element).find('.roster-status'), pres);
        $(element).find('.roster-name').text(name)
      }

      $(list).each(function () {
        var cmp_pres = self.presenceValue(
            $(this).find('.roster-status'));
        var cmp_name = $(this).find('.roster-name').text();

        if (pres > cmp_pres) {
          $(this).before(element);
          inserted = true;
          return false;
        } else if (pres === cmp_pres && name < cmp_name) {
            $(this).before(element);
            inserted = true;
            return false;
        }
      });

      if (!inserted) {
        parent.append(element);
      }

    };
    this.getRosterElement = function (roster) {
      var jid = roster.jid;
      var name = roster.name || jid;

      // transform jid into an id
      var id = self.jidToId(jid);

      var element = $("<li class=" + id + "></li>");
      $("<a data-toggle='tab' class='roster-contact'  href='#" + id + "'></a>")
          .append("<div class='roster-jid' style=\"display:none\">" + jid + "</div>")
          .append("<div class='roster-status " + self.rosterStatus(roster.resources) + "'> </div>")
          .append("<div class='roster-name'>" + name + "</div>")
          .appendTo(element);

      return element;
    };
  }
  var _INSTANCE = new XmppUtils();

  $.getXmppUtils = function(){
    return _INSTANCE;
  }
})(jQuery);
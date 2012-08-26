/**
 * Created with JetBrains RubyMine.
 * User: kpankaj
 * Date: 8/19/12
 * Time: 3:47 AM
 * To change this template use File | Settings | File Templates.
 */
(function ($) {
  $.XmppUtils = {
    jidToId:function (jid) {
      return Strophe.getBareJidFromJid(jid)
          .replace(/@/g, "-")
          .replace(/\./g, "-")
          .replace(/\/.*/g, "");
    },
    rosterStatus:function (resources) {
      var status = 'offline';
//      console.log(resources);
      $.each(resources, function (key, value) {
//        console.log(value);
        if (value.show === "online" || value.show === "") {
          status = 'online'
        } else if (status != 'online' && value.show === "away" ) {
          status = 'away';
        }
      })
      return status;
    },
    presenceValue:function (elem) {
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
    },
    setPresence:function (element, pres) {
      element = $(element).find('.roster-status');
      $(element).removeAttr('class');
      $(element).addClass('roster-status')
      if (pres == 2) {
        $(element).addClass('online');
      } else if (pres == 1) {
        $(element).addClass('away');
      } else {
        $(element).addClass('offline');
      }
    },
    updateContact:function (list, roster) {
      var jid = $.XmppUtils.jidToId(roster.jid);
      var name = roster.name;
      var pres = $.XmppUtils.presenceValue($.XmppUtils.rosterStatus(roster.resources));

      var inserted = false;
      var element = $(list).parent().find('.' + jid)

      if(!element){
        element = $.XmppUtils.getRosterElement(roster)
      } else {
        element.detach();
        $.XmppUtils.setPresence(element, pres)
      }

      $(list).each(function () {
        var cmp_pres = $.XmppUtils.presenceValue(
            $(this).find('.roster-status'));
        var cmp_name = $(this).find('.roster-name').text();

        if (pres > cmp_pres) {
          $(this).before(element);
          inserted = true;
          return false;
        } else if (pres === cmp_pres) {
          if (name < cmp_name) {
            $(this).before(element);
            inserted = true;
            return false;
          }
        }
      });

      if (!inserted) {
        $(list).parent().append(element);
      }

    },
    searchContacts:function (list, searchTerm) {
      $(list).each(function () {
        var name = $(this).find('.roster-name').text();
        if (searchTerm.length > 0 && name.match(/searchTerm+/i) == null) {
          $(this).css({'visibility':'hidden'})
        } else {
          $(this).css({'visibility':'visible'})
        }
      })
    },
    getRosterElement:function (roster) {
      var jid = roster.jid;
      var name = roster.name || jid;

      // transform jid into an id
      var id = $.XmppUtils.jidToId(jid);

      var element = $("<li class=" + id +  "></li>");
      $("<a data-toggle='chat' class='roster-contact'  href='#" + id + "'></a>")
          .append("<div class='roster-jid' style=\"display:none\">" + jid + "</div>")
          .append("<div class='roster-status " + $.XmppUtils.rosterStatus(roster.resources) + "'> </div>")
          .append("<div class='roster-name'>" + name + "</div>")
          .appendTo(element);

      return element;
    }
  }
})(jQuery);
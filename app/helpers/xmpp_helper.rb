module XmppHelper

  require 'xmpp4r'
  require 'xmpp4r/client'
  require 'xmpp4r/roster'
  include Jabber

  def xmpp_login
    client = connect
  end

  def xmpp_logout
  end

  private
  def connect
    client = Client.new(JID::new("metly@metly.com"))
    client.connect
    begin
      client.auth("metly")
    rescue
      client.register("metly")
      client.auth("metly")
    end
    client
  end

end
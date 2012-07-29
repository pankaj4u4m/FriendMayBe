
require 'xmpp4r'
require 'xmpp4r/client'
require 'xmpp4r/roster'
require 'optparse'

require "jabber_http_binding_client"
include Jabber

module XmppHelper

  Jabber::debug = true

  def xmpp_login(jid, pass)
    @client = connect(jid, pass)
    {http_sid: @client.http_sid, http_rid: @client.http_rid, jid: @client.jid,
    id: jid, pass: pass}
  end

  def self.xmppRegister(jid, pass)
    client =JabberHTTPBindingClient.new(JID::new("#{jid}@localhost"))
    client.connect('http://localhost/bosh', 'localhost', 5222)
    client.register(pass)
    client.close
  end

  private
  def connect(jid, pass)
    @client =JabberHTTPBindingClient.new(JID::new("#{jid}@localhost"))
    @client.connect('http://localhost/bosh', 'localhost', 5222)
    begin
      @client.auth(pass)
    rescue
      XmppHelper.xmppRegister(jid, pass)
    end
    @client.close
    @client
  end

end
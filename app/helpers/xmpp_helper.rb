
require 'xmpp4r'
require 'xmpp4r/client'
require 'xmpp4r/roster'
require 'optparse'

require "jabber_http_binding_client"
include Jabber

module XmppHelper

  Jabber::debug = true
  @httpbind = 'http://localhost/bosh'
  @host = 'localhost'
  @port = 5222
  @jid = 'metly@metly.com'
  @pass = 'metly'
  @client

  def xmpp_login(jid, pass)
    @pass = pass
    @client = connect(jid)
    {http_sid: @client.http_sid, http_rid: @client.http_rid, jid: @client.jid}
  end

  def xmpp_logout
    @client.close()
  end

  private
  def connect(jid)
    @jid = JID::new('metly@metly.com')
    @client =JabberHTTPBindingClient.new(@jid)
    @client.connect('http://localhost/bosh', 'localhost', 5222)
    begin
      @client.auth('metly')
      @client.close
    rescue
  #    @client.register(@pass)
  #    @client.auth(@pass)
    end
    @client
  end

end
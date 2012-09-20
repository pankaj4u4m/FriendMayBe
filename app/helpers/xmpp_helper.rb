
require 'xmpp4r'
require 'xmpp4r/client'
require 'xmpp4r/roster'
require 'xmpp4r/vcard/helper/vcard'
require 'optparse'

require "jabber_http_binding_client"
include Jabber

module XmppHelper

  Jabber::debug = true
  
  @domain = nil
  @my_jid = nil
  @my_pass = nil
  @user = nil;
  #@closeCounter = 0

  def xmppLogin(jid = nil, pass = nil, user = nil)
    @domain = "localhost"
    if(jid.nil?)
      @my_jid = nil
      @client = JabberHTTPBindingClient.new("#{@domain}")
      @client.connect("http://#{@domain}/bosh", "#{@domain}", 5222)
      @client.auth_anonymous_sasl
      @client.close;
    else
      @my_jid = JID::new("#{jid}@#{@domain}")
      @my_pass = pass
      @user = user;
      Rails.logger.info "my_jid:#{@my_jid}"
      Rails.logger.info "my_pass:#{@my_pass}"

      @client = xmppHttpbindConnect
    end


    #t = Thread.new do
    #  while true do
    #    --@closeCounter
    #    if @closeCounter <= 0
    #      @socketClient.close
    #    end
    #    sleep 1000
    #  end
    #end

    {http_sid: @client.http_sid, http_rid: @client.http_rid, jid: @client.jid}
  end

  def self.xmppRegister(jid, pass, name)
    begin
      client =Jabber::Client.new(JID::new(jid))
      client.connect
      client.register(pass)
      client.connect
      client.auth(pass)
      vcard_helper = Vcard::Helper.new(client)
      vcard = vcard_helper.get
      vcard["NICKNAME"] = name
      vcard_helper.set(vcard)
      iq = Jabber::Iq.new(:set)
      iq.add(Jabber::Roster::IqQueryRoster.new)
        .add(Jabber::Roster::RosterItem.new("metly@#{@domain}", 'metly'))
      client.send(iq)
      client.close
    rescue => e
      Rails.logger.error "Failed to register user #{jid} name: #{name} \n#{e.backtrace.join("\n")}"
    end
  end

  private

  def xmppHttpbindConnect
    @client =JabberHTTPBindingClient.new(@my_jid)
    @client.connect("http://#{@domain}/bosh", "#{@domain}", 5222)
    begin
      @client.auth(@my_pass)
    rescue
      @client.close
      XmppHelper.xmppRegister(@my_jid, @my_pass, @user.user_details[0].name)
      @client = JabberHTTPBindingClient.new(@my_jid)
      @client.connect("http://#{@domain}/bosh", "#{@domain}", 5222)
      @client.auth(@my_pass)
    end
    @client.close
    @client
  end

end
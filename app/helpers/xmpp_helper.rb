
require 'xmpp4r'
require 'xmpp4r/client'
require 'xmpp4r/roster'
require 'optparse'

require "jabber_http_binding_client"
include Jabber

module XmppHelper

  Jabber::debug = true
  @domain = nil
  @my_jid = nil
  @my_pass = nil
  @closeCounter = 0

  def xmppLogin(jid, pass)
    @domain = "localhost"
    @my_jid = JID::new("#{jid}@#{@domain}")
    @my_pass = pass
    Rails.logger.info "my_jid:#{@my_jid}"
    #Rails.logger.info "my_pass:#{@my_pass}"

    xmppSocketConnect
    @client = xmppHttpbindConnect

    t = Thread.new do
      while true do
        --@closeCounter
        if @closeCounter <= 0
          @socketClient.close
        end
        sleep 1000
      end
    end

    {http_sid: @client.http_sid, http_rid: @client.http_rid, jid: @client.jid}
  end

  def self.xmppRegister(jid, pass)
    begin
      client =Jabber::Client.new(JID::new(jid))
      client.connect
      client.register(pass)
      client.close
    rescue => e
      Rails.logger.error "Failed to register user #{jid} \n#{e.backtrace.join("\n")}"
    end
  end

  def xmppSend(message)
    #@closeCounter = 10
    #begin
    #  @socketClient.send(message)
    #rescue
    #  begin
    #    if @socketClient
    #      @socketClient.close
    #    end
    #  rescue
    #  end
    #  xmppSocketConnect
    #  @socketClient.send(message)
    #end
  end

  def getOnlineUsers

  end

  private
  def xmppSocketConnect
    @closeCounter = 10
    @socketClient = Jabber::Client.new(@my_jid)
    @socketClient.connect
    begin
      @socketClient.auth(@my_pass)
    rescue
      XmppHelper.xmppRegister(@my_jid, @my_pass)
      @socketClient = Jabber::Client.new(@my_jid)
      @socketClient.connect
      @socketClient.auth(@my_pass)
    end
  end

  def xmppHttpbindConnect
    @client =JabberHTTPBindingClient.new(@my_jid)
    @client.connect("http://#{@domain}/bosh", "#{@domain}", 5222)
    @client.auth(@my_pass)
    @client.close
    @client
  end

end
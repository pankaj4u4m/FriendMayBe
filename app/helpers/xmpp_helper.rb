
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

  def xmppLogin(jid, pass, user)
    @domain = "localhost"
    @my_jid = JID::new("#{jid}@#{@domain}")
    @my_pass = pass
    @user = user;
    Rails.logger.info "my_jid:#{@my_jid}"
    Rails.logger.info "my_pass:#{@my_pass}"

    @client = xmppHttpbindConnect

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
      client.close
    rescue => e
      Rails.logger.error "Failed to register user #{jid} name: #{name} \n#{e.backtrace.join("\n")}"
    end
  end

  #def getOnlineUsers
  #
  #end
  def self.getStranger(me)
    stranger= Stranger.tryConnect(me);
    Rails.logger.debug("stranger:#{stranger}")
    if stranger.nil?
      stranger = userwait(me)
    else
      stranger = userconnect(me, stranger)
    end
    return {stranger: stranger}
  end
  private

  def xmppHttpbindConnect
    @client =JabberHTTPBindingClient.new(@my_jid)
    @client.connect("http://#{@domain}/bosh", "#{@domain}", 5222)
    begin
      @client.auth(@my_pass)
    rescue
      XmppHelper.xmppRegister(@my_jid, @my_pass, @user.user_details[0].name)
      @client = JabberHTTPBindingClient.new(@my_jid)
      @client.connect("http://#{@domain}/bosh", "#{@domain}", 5222)
      @client.auth(@my_pass)
    end
    @client.close
    @client
  end

  def self.userwait(me)
    Rails.logger.debug("waiting #{me}")
    Stranger.waiting(me);
    counter = 0;
    stranger = Rails.cache.read(me)
    while stranger.nil?
      break if counter > 20
      sleep(0.5);
      counter +=1;
      stranger = Rails.cache.read(me)
    end
    return stranger
  end

  def self.userconnect(me, stranger)
    withuser = stranger
    Rails.logger.debug("me #{me} stranger #{withuser.user_id} updateed_time #{withuser.updated_time} timenow=#{Time.now}")
    while !withuser.nil? && ( withuser.user_id.equal?(me) || (withuser.updated_time + 20 < Time.now))
      withuser.destroy;
      withuser = Stranger.tryConnect(me);
      Rails.logger.debug("me #{me} stranger #{withuser.user_id} updateed_time #{withuser.updated_time} timenow=#{Time.now}") if !withuser.nil?
    end
    if withuser.nil? || (withuser.user_id.equal?(me) )
      return userwait(me)
    else
      Rails.cache.write(withuser.user_id, me, expires_in: 20.seconds)
      return withuser.user_id
    end
  end

end
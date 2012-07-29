require 'xmpp4r/httpbinding/client'
class Xmpp4rHttpBind < Jabber::HTTPBinding::Client

  def initialize(jid)
    super(jid)
  end

  def start
    req_body = REXML::Element.new('body')
    req_body.attributes['rid'] = @http_rid += 1
    req_body.attributes['xmlns'] = 'http://jabber.org/protocol/httpbind'
    req_body.attributes['sid'] = @http_sid
    req_body.attributes['to'] = @jid.domain
    req_body.attributes['xml:lang'] = 'en'
    req_body.attributes['xmpp:restart'] = 'true'
    req_body.attributes['xmlns:xmpp'] = 'urn:xmpp:xbosh'

    res_body = post(req_body)
    unless res_body.name == 'body'
      raise 'Response body is no <body/> element'
    end
    receive_elements_with_rid(@http_rid, res_body.children)
  end

  def stop

  end
end
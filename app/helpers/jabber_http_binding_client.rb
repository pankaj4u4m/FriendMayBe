require 'xmpp4r/httpbinding/client'

class JabberHTTPBindingClient < Jabber::HTTPBinding::Client

  attr_reader :http_sid
  attr_reader :http_rid

  def initialize(jid)
    super(jid)
    @retries = @MAX_RETRIES = 5
    http_wait=5
    http_hold=1
  end

  ##
  # Prepare data to POST and
  # handle the result
  def post_data(data)
    req_body = nil
    current_rid = nil

    @lock.synchronize {
      # Do not send unneeded requests
      if data.size < 1
        return
      end

      req_body = "<body"
      req_body += " rid='#{@http_rid += 1}'"
      req_body += " sid='#{@http_sid}'"
      req_body += " xmlns='http://jabber.org/protocol/httpbind'"
      req_body += ">"
      req_body += data
      req_body += "</body>"
      current_rid = @http_rid

      @pending_requests += 1
      @last_send = Time.now
    }
    res_body = post(req_body)

    receive_elements_with_rid(current_rid, res_body.children)
    @retries = @MAX_RETRIES
  rescue REXML::ParseException
          if @exception_block
            Thread.new do
              Thread.current.abort_on_exception = true
              close; @exception_block.call(e, self, :parser)
            end
          else
      Jabber::debuglog "Exception caught when parsing HTTP response!"
      close
      raise
          end
  rescue StandardError => e
    Jabber::debuglog("POST error (will retry): #{e.class}: #{e}")
    receive_elements_with_rid(current_rid, [])
    # It's not good to resend on *any* exception,
    # but there are too many cases (Timeout, 404, 502)
    # where resending is appropriate
    # TODO: recognize these conditions and act appropriate
    if @retries
      @retries -=1
      send_data(data)
    end
    #end
  end

  ##
  # Send data,
  # buffered and obeying 'polling' and 'requests' limits
  def send_data(data)

    @lock.synchronize do

      Thread.new do
        Thread.current.abort_on_exception = true
        post_data(data)
      end
    end
  end

  ##
  # Start the stream-parser and send the client-specific stream opening element
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
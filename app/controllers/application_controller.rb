class ApplicationController < ActionController::Base
  protect_from_forgery
  around_filter :global_request_logging


  def global_request_logging
    http_request_header_keys = request.headers.keys.select{|header_name| header_name.match("^HTTP.*")}
    http_request_headers = request.headers.select{|header_name, header_value| http_request_header_keys.index(header_name)}
    logger.info "Received #{request.method.inspect} to #{request.url.inspect} from #{request.remote_ip.inspect}.  Processing with headers #{http_request_headers.inspect} and params #{params.inspect}"
    begin
      yield
    ensure
      logger.info "Responding with #{response.status.inspect} => #{response.body.inspect}"
    end
  end

  #rescue_from ActionController::RoutingError, :with => :routing_error
  #
  #def routing_error(exception = nil)
  #  if exception
  #    logger.info "Rendering 404: #{exception.message}"
  #  end
  #  #render params[:path]
  #  render :file => "#{Rails.root}/public/404.html", :status => 404, :layout => false
  #end


  private
  def after_sign_in_path_for(resource)
    root_path
  end

  def after_sign_out_path_for(resource_or_scope)
    root_path
  end

end

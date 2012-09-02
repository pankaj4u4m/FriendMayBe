class ApplicationController < ActionController::Base
  protect_from_forgery

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

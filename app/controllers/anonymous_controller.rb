class AnonymousController < ApplicationController
  include XmppHelper

  def anonymous
    @onlineUsers = 200;
  end

  def anonymouslogin
    client = xmppLogin()
    respond_to do |format|
      format.js { render json: client}
    end
  end

  def location

    LoginLocation.create(
        location: RGeo::Cartesian.factory.point(params[:latitude], params[:longitude]),
        resource: params[:resource]
    )
    respond_to do |format|
      format.js { render json: {status: 'saved'}}
    end
  end

  def notification
    respond_to do |format|
      format.js { render json: {status: 'anonymous'}}
    end
  end
end

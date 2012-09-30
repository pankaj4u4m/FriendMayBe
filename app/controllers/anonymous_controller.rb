class AnonymousController < ApplicationController
  include XmppHelper

  def anonymous
    @onlineUsers = Rails.cache.read('onlineUsers')
    if @onlineUsers.nil?
      @onlineUsers = 1
    else
      @onlineUsers += 1
    end
    Rails.cache.write('onlineUsers', @onlineUsers, :timeToLive => 1.day)
    Thread.new do
      sleep(20.minutes)
      @onlineUsers = Rails.cache.read('onlineUsers')
      if @onlineUsers.nil?
        @onlineUsers = 0
      else
        @onlineUsers -= 1
      end
      Rails.cache.write('onlineUsers', @onlineUsers, :timeToLive => 1.day)
    end
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

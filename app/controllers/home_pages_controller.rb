class HomePagesController < ApplicationController
  before_filter :authenticate_user!

  include XmppHelper

  def home
    @user = current_user
  end

  def login
    @user = current_user
    client = xmppLogin(@user.xmpp, Digest::MD5.hexdigest(@user.encrypted_password), @user)
    respond_to do |format|
      format.js { render json: client}
    end
  end

  def location
    @user = current_user
    @user.save_login_locations(params[:latitude], params[:longitude], params[:resource])
    respond_to do |format|
      format.js { render json: {status: 'saved'}}
    end
  end
  def notification
    @user = current_user;
    request = OfRoster.getRequestedUsers(@user);
    messages = MessageArchive.getUniqueMessages(@user);
    count = OfOffline.getCount(@user);
    respond_to do |format|
      format.js { render json: {requests: request, messages: messages, count:count}}
    end
  end
end

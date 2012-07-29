class HomePagesController < ApplicationController
  before_filter :authenticate_user!

  include XmppHelper

  def home
    @user = current_user
  end

  def logout
    redirect_to destroy_user_session_path method: :delete
  end

  def login
    @user = current_user
    client = xmpp_login(@user.xmpp, Digest::MD5.hexdigest(@user.encrypted_password))
    respond_to do |format|
      format.js { render json: client}
    end
  end
end

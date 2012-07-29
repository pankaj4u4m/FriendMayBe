class HomePagesController < ApplicationController
  #before_filter :authenticate_user!

  include XmppHelper

  def home
    @user = current_user
  end

  def logout
    xmpp_logout
    redirect_to destroy_user_session_path method: :delete
  end

  def login
  #  client = xmpp_login(@user.email, @user.encrypted_password)
    client = xmpp_login('metly@metly.com', 'metly')
    respond_to do |format|
      format.js { render json: client}
    end
  end
end

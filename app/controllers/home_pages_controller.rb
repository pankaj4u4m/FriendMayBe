class HomePagesController < ApplicationController
  before_filter :authenticate_user!

  include XmppHelper

  def home
    @user = current_user
  end

  def logout
    xmpp_logout
    redirect_to destroy_user_session_path method: :delete
  end

  def login
    xmpp_login
  end
end

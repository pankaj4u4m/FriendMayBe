class MessagesController < ApplicationController
  before_filter :authenticate_user!


  def senders
    @senders = current_user.senders
    respond_to do |format|
      format.js { render json: @senders }
    end

  end

  def receivers
    @remember_to_users = current_user.rememberer_users
    respond_to do |format|
      format.js { render json: @remember_to_users }
    end
  end


  def sendmessage
    @user = User.find(params[:receiver])
    current_user.sendmessage!(@user, params[:message])
    redirect_to do |format|
      format.js
    end
  end

end
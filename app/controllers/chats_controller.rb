class ChatsController < ApplicationController
  before_filter :authenticate_user!

  include XmppHelper

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

  def stranger
    #stranger = XmppHelper.getStranger(params[:me])
    respond_to do |format|
      format.js { render json: {stranger: 'pankaj@localhost'} }
    end
  end

end
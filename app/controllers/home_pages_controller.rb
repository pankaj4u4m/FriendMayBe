class HomePagesController < ApplicationController
  before_filter :authenticate_user!

  include XmppHelper

  def home
    @user = current_user
    Thread.new do
      sleep(5000*50)
    end
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
    #request = OfRoster.getRequestedUsers(@user);
    minMessageId = params['minMessageId'];
    if(! minMessageId.is_a? Integer )
       minMessageId = minMessageId.to_i;
    end

    if(minMessageId == nil || minMessageId < 0 || minMessageId > 2**63)
      minMessageId = 2**63 -1;
    end
    messages = MessageArchive.getUniqueMessages(@user, minMessageId);
    #count = OfOffline.getCount(@user);
    respond_to do |format|
      format.js { render json: {messages: messages}}
    end
  end
  def feedback
    Feedback.create({
          user_id: current_user.id,
          feedback: params['feedback']
    })
    respond_to do |format|
      format.js { render json: {}}
    end
  end
end

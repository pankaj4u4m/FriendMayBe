class LoginPagesController < ApplicationController


  def login
    @onlineUsers = Rails.cache.read('onlineUsers')
  end

  def help
  end

  def contact
  end

  def privacy

  end
  def feedback
    Feedback.create({
                        user_id: 0,
                        feedback: params['feedback']
                    })
    respond_to do |format|
      format.js { render json: {status: 'feedback'}}
    end
  end
end

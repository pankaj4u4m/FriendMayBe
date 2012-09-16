class LoginPagesController < ApplicationController
  def login
  end

  def help
  end

  def contact
  end

  def termofusage

  end

  def privacy

  end
  def feedback
    Feedback.create({
                        user_id: 0,
                        feedback: params['feedback']
                    })
    respond_to do |format|
      format.js { render json: {}}
    end
  end
end

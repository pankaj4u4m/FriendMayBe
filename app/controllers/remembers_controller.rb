class RemembersController < ApplicationController
  before_filter :authenticate_user!


  def remembereds
    @remembereds = current_user.remembered_users
    respond_to do |format|
      format.js { render json: @remembereds.to_json(
        only: [:email, :id],
        include: {user_details:{only:  [:birthday, :name, :gender]}}
      ) }
    end

  end

  def rememberers
    @rememberers = current_user.rememberer_users
    respond_to do |format|
      format.js { render json: @rememberers }
    end
  end


  def remember
    @user = User.find(params[:remembered_id])
    current_user.remember!(@user)
    redirect_to do |format|
      format.js
    end
  end

  def forget
    @user = User.find(params[:remembered_id])
    current_user.forget!(@user)
    respond_to do |format|
      format.js
    end
  end

  def block
    @user = User.find(params[:remembered_id])
    current_user.block!(@user)
    respond_to do |format|
      format.js
    end
  end

end
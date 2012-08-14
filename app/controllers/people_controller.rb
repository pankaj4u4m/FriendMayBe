class PeopleController < ApplicationController
  before_filter :authenticate_user!

  def home
    @user = current_user
  end

  def search

  end
end

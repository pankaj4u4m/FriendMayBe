class LoginHistory < ActiveRecord::Base
  attr_accessible :login_time, :logout_time, :timestamp

  belongs_to :location
  belongs_to :user

  validates :user_id, presence: true
  validates :location_id, presence: true
end

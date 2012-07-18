class UserDetail < ActiveRecord::Base
  attr_accessible :birthday, :details, :name, :gender, :provider, :uid
  belongs_to :user
  validates :user_id, presence: true

end

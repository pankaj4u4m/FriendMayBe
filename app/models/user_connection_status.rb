class UserConnectionStatus < ActiveRecord::Base
  attr_accessible :stranger_id, :user_status
  belongs_to :user, class_name: 'User'
  belongs_to :stranger, class_name: 'User'

  validates :user_id, presence: true
  validates :stranger_id, presence: true
end

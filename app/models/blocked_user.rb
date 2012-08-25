class BlockedUser < ActiveRecord::Base
  attr_accessible :blocked_id, :reason
  belongs_to :blocker, class_name: 'User'
  belongs_to :blocked, class_name: 'User'

  validates :blocker_id, presence: true
  validates :blocked_id, presence: true

end

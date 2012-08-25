class MessageArchive < ActiveRecord::Base
  attr_accessible :body, :receiver_id

  belongs_to :serder, class_name: 'User'
  belongs_to :receiver, class_name: 'User'

  validates :sender_id, presence: true
  validates :receiver_id, presence: true

end

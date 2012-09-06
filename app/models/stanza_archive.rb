class StanzaArchive < ActiveRecord::Base
  attr_accessible :stanza, :stanza_type, :receiver_id

  belongs_to :sender, class_name: 'User'
  belongs_to :receiver, class_name: 'User'

  validates :sender_id, presence: true
  validates :receiver_id, presence: true

end

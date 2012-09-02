class MessageArchive < ActiveRecord::Base
  attr_accessible :body, :receiver_id

  belongs_to :serder, class_name: 'User'
  belongs_to :receiver, class_name: 'User'

  validates :sender_id, presence: true
  validates :receiver_id, presence: true

  def self.getUniqueMessages(user)
    #MessageArchive.find_by_sql('select * from (select max(id) id from message_archives where receiver_id=1 AND sender_id IS NOT null group by sender_id) m join message_archives a on m.id=a.id').order("id DESC").limit(10);
    return MessageArchive.joins(' JOIN (select max(id) as maxid from message_archives where receiver_id=' + user.id +  ' AND sender_id IS NOT null group by sender_id) as m ON m.maxid = id').order("id DESC").limit(10);
  end
end

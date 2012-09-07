class MessageArchive < ActiveRecord::Base
  attr_accessible :body, :receiver_id

  belongs_to :sender, class_name: 'User'
  belongs_to :receiver, class_name: 'User'

  validates :sender_id, presence: true
  validates :receiver_id, presence: true

  def self.getUniqueMessages(user, minMessageId)
    #MessageArchive.find_by_sql('select * from (select max(id) id from message_archives where receiver_id=1 AND sender_id IS NOT null group by sender_id) m join message_archives a on m.id=a.id').order("id DESC").limit(10);
    return ActiveRecord::Base.connection.execute('SELECT s.id, body, u.xmpp, r.xmpp FROM message_archives as s JOIN (select max(id) as maxid from message_archives where (receiver_id=' \
                        + user.id.to_s \
                        + ' OR sender_id= ' \
                        + user.id.to_s \
                        + ' ) AND sender_id IS NOT NULL AND receiver_id IS NOT NULL group by sender_id,receiver_id) as m ON (m.maxid = s.id AND maxid< '\
                        + minMessageId.to_s \
                        + ') JOIN users as u ON u.id=s.sender_id JOIN users r ON r.id=s.receiver_id ORDER BY s.id ASC LIMIT 10'
                      ).map { |r| {id: r[0], body: r[1], sender: r[2], receiver: r[3]} }
  end
end

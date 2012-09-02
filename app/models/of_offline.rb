class OfOffline < ActiveRecord::Base
  set_table_name 'ofOffline';
  set_primary_keys :username, :messageID

  attr_accessible :username, :messageID, :creationDate, :messageSize, :stanza

  def self.getCount(user)
    return OfOffline.where(username: user.xmpp).count;
  end
end
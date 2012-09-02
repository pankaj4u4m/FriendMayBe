class OfRoster < ActiveRecord::Base
  set_table_name 'ofRoster';
  set_primary_key :rosterID;

  attr_accessible :rosterID, :username, :jid, :sub, :ask, :recv, :nick

  def self.getRequestedUsers(user)
    return OfRoster.where(jid: user.xmpp).where(ask: 0);
  end

end
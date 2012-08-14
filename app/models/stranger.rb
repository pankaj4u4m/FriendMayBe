class Stranger < ActiveRecord::Base
  attr_accessible :connected_user, :connection_status, :updated_time, :user_id
  validates :user_id, presence: true

  def self.tryConnect(user)
    Stranger.update_all(
        {connection_status: 'IDEAL',
         connected_user: user},
        {connection_status: 'WAITING'}, limit: 1);
    stranger = Stranger.find_by_connected_user(user)
    return (stranger && stranger.connection_status == 'IDEAL' )? stranger : nil;
  end

  def self.waiting(user)
    stranger = Stranger.find_or_initialize_by_user_id(user)
    stranger.connection_status = 'WAITING'
    stranger.updated_time = Time.now;
    stranger.connected_user = nil;
    stranger.save;
    return stranger
  end

  def self.connecting(user, withuser)
    withuser.connection_status = 'CONNECTING'
    withuser.connected_user = user
    withuser.updated_time = Time.now
    withuser.save;
    Rails.logger.debug("changed found #{withuser.user_id} #{withuser.connected_user} #{withuser.connection_status}")
  end

  def self.connected(user)
    stranger = Stranger.find_by_user_id(user);
    Rails.logger.debug("connecting found #{stranger.user_id} #{stranger.connected_user} #{stranger.connection_status}")
    if stranger.connection_status.equal?('CONNECTING')
      stranger.connection_status = 'CONNECTED'
      stranger.updated_time = Time.now;
      stranger.save
      return stranger
    end
    return nil;
  end

  def self.ideal(user)
    Stranger.delete_all(user_id: user)
  end

end

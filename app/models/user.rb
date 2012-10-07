class User < ActiveRecord::Base

  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable,
  # :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable,
         :omniauthable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :password_confirmation, :remember_me, :xmpp, :name
  # attr_accessible :title, :body

  has_many :user_details

  has_many :login_locations, foreign_key: "login_id"


  has_many :blocked_users, foreign_key: "blocker_id"
  has_many :blockeds, through: :blocked_users, source: :blocked
  has_many :reverse_blocked_users, foreign_key: "blocked_id",
           class_name:  "BlockedUser"
  has_many :blockers, through: :reverse_blocked_users, source: :blocker

  has_many :message_archives, foreign_key: "sender_id"
  has_many :reveivers, through: :message_archives, source: :receiver
  has_many :reverse_message_archives, foreign_key: "receiver_id",
           class_name: "MessageArchive"
  has_many :senders, through: :reverse_message_archives, source: :sender

  has_many :stanza_archives, foreign_key: "sender_id"
  has_many :reveivers, through: :stanza_archives, source: :receiver
  has_many :reverse_stanza_archives, foreign_key: "receiver_id",
           class_name: "StanzaArchive"
  has_many :senders, through: :reverse_stanza_archives, source: :sender

  has_many :user_connection_statuses, foreign_key: "user_id"
  has_many :strangers, through: :user_connection_statuses, source: :user
  has_many :reverse_user_connection_statuses, foreign_key: "stranger_id",
           class_name:  "UserConnectionStatus"
  has_many :users, through: :reverse_user_connection_statuses, source: :stranger


  def self.find_for_facebook_oauth(auth, signed_in_resource=nil)
    user = User.where(:email => auth.info.email).first
    if !user
      user = save_user(auth)
    end
    detail = user.save_or_update_user_details(auth)
    return detail ? user : nil;
  end

  def self.find_for_google_oauth2(auth, signed_in_resource=nil)
    user = User.where(:email => auth.info.email).first
    if !user
      user = save_user(auth)
    end
    #TODO remove eachtime update put update on time
    detail = user.save_or_update_user_details(auth)
    return detail ? user : nil;
  end

  def self.new_with_session(params, session)
    super.tap do |user|
      if data = session["devise.facebook_data"] && session["devise.facebook_data"]["info"]
        user.email = data["email"] if user.email.blank?
      elsif data = session["devise.google_data"] && session["devise.google_data"]["info"]
        user.email = data["email"] if user.email.blank?
      end
    end
  end

  def self.save_user(auth)
    user = User.create(
        name:auth.info.name,
        email: auth.info.email,
        password: Devise.friendly_token[0, 20],
        xmpp: Digest::MD5.hexdigest(auth.info.email)
    )
    OfUser.delete(user.xmpp);
    XmppHelper.xmppRegister("#{user.xmpp}@friendmaybe.com", Digest::MD5.hexdigest(user.encrypted_password), auth.info.name)
    user
  end

  def save_or_update_user_details(auth)
    detail = self.user_details.where(provider: auth.provider, uid: auth.uid).first
    if detail
      detail.name = auth.info.name
      detail.gender = auth.extra.raw_info.gender
      detail.birthday = auth.extra.raw_info.birthday
      detail.details = ActiveSupport::JSON.encode(auth)
      detail.save;
      return detail
    end
    detail = UserDetail.new(
        name: auth.info.name,
        gender: auth.extra.raw_info.gender,
        details: ActiveSupport::JSON.encode(auth),
        uid: auth.uid,
        provider: auth.provider,
        birthday: auth.extra.raw_info.birthday

    )
    self.user_details << detail;
    return detail
  end

  def save_login_locations(lat, lon, resource)
    loginLocation = LoginLocation.new(
        location: RGeo::Cartesian.factory.point(lat, lon),
        resource: resource
    )
    self.login_locations << loginLocation
    self.save;
  end
end

class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable,
  # :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable,
         :omniauthable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :password_confirmation, :remember_me
  # attr_accessible :title, :body

  has_many :user_details

  has_many :remembers, foreign_key: "rememberer_id"
  has_many :remembered_users, through: :remembers, source: :remembered
  has_many :reverse_remembers, foreign_key: "remembered_id",
           class_name:  "Remember"
  has_many :rememberer_users, through: :reverse_remembers, source: :rememberer


  has_many :messages, foreign_key: "sender_id"
  has_many :reveivers, through: :messages, source: :receiver
  has_many :reverse_messages, foreign_key: "receiver_id",
           class_name:  "Message"
  has_many :senders, through: :reverse_messages, source: :sender


  def remembered?(other_user)
    remembers.where(remembered_id: other_user.id, status: 'A')
  end

  def remember!(other_user)
    remembers.create!(remembered_id: other_user.id, status: 'A')
  end

  def forget!(other_user)
    remember = remembers.find_by_remembered_id(other_user.id).first
    if remember
      remember.status = 'I'
    end
    #reverse_remembers.find_by_user_id_by(self.id).destroy
  end

  def block!(other_user)
    remember = remembers.find_by_remembered_id(other_user.id).first
    if remember
      remember.status = 'B'
    end
  end

  def sendmessage!(other_user, mesage)
    messages.create!(receiver_id: other_user.id, message: mesage, message_time: Time.now)
  end

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
        email: auth.info.email,
        password: Devise.friendly_token[0, 20]
    )
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

end

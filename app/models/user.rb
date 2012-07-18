class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable,
  # :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable,
         :omniauthable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :password_confirmation, :remember_me, :provider, :uid
  # attr_accessible :title, :body

  has_many :user_details

  def self.find_for_facebook_oauth(auth, signed_in_resource=nil)
    user = User.where(:email => auth.info.email).first
    if !user
      user = save_user(auth)
      detail =  user.save_user_details(auth)
    elsif !(detail = user.user_details.where(provider: auth.provider, uid: auth.uid).first)
      detail =  user.save_user_details(auth)
    end
    detail ? user : null;
  end

  def self.find_for_google_oauth2(auth, signed_in_resource=nil)
    user = User.where(:email => auth.info.email).first
    if !user
      user = save_user(auth)
      detail =  user.save_user_details(auth)
    elsif !(detail = user.user_details.where(provider: auth.provider, uid: auth.uid).first)
      detail =  user.save_user_details(auth)
    end
    detail ? user : null;
  end

  def self.new_with_session(params, session)
    super.tap do |user|
      if data = session["devise.facebook_data"] && session["devise.facebook_data"]["extra"]["raw_info"]
        user.email = data["email"] if user.email.blank?
      elsif data = session["devise.google_data"] && session["devise.google_data"]["info"]
        user.email = data["email"] if user.email.blank?
      end
    end
  end

  def self.save_user(auth)
    user = User.create(
        email:auth.info.email,
        password:Devise.friendly_token[0,20]
    )
    user
  end

  def save_user_details(auth)
    detail = UserDetail.new(
        name: auth.info.name,
        gender: auth.extra.raw_info.gender,
        details: ActiveSupport::JSON.encode(auth),
        uid: auth.uid,
        provider: auth.provider
    )
    self.user_details << detail;
    detail
  end
end

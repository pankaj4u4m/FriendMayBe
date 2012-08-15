class Location < ActiveRecord::Base
  attr_accessible :latitude, :longitude, :name

  has_many :login_histories

end

class LoginLocation < ActiveRecord::Base
  attr_accessible :location, :resource
  belongs_to :login, class_name: 'User'


  #set_rgeo_factory_for_column(:location,
  #    RGeo::Geographic.spherical_factory(:srid => 4326))

end

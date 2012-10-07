class OfUser < ActiveRecord::Base
  set_table_name 'ofUser'
  set_primary_key :username

  attr_accessible :name, :username
end
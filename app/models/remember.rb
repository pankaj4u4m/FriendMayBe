class Remember < ActiveRecord::Base
  attr_accessible :status, :remembered_id
  belongs_to :rememberer, class_name: "User"
  belongs_to :remembered, class_name: "User"

  validates :rememberer_id, presence: true
  validates :remembered_id, presence: true
end

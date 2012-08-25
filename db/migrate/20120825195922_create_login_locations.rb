class CreateLoginLocations < ActiveRecord::Migration
  def change
    create_table :login_locations do |t|
      t.integer :login_id
      t.point :location
      t.string :resource

      t.timestamps
    end
    add_index :login_locations, :login_id
    add_index :login_locations, [:login_id, :resource]
  end
end
